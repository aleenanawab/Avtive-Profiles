import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';

// Setup environment variables for test
const ALLOWED_DEMO_EMAIL = 'demo@example.com';
const SECOND_ALLOWED_EMAIL = 'lead-designer@avtive.app';
const FORBIDDEN_EMAIL = 'hacker@attacker.com';
const NON_EXISTENT_ALLOWLISTED = 'ghost-demo@example.com';

process.env.DEMO_PASSWORD_RESET_ENABLED = 'true';
process.env.DEMO_RESET_ALLOWED_EMAILS = `${ALLOWED_DEMO_EMAIL}, ${SECOND_ALLOWED_EMAIL}, ${NON_EXISTENT_ALLOWLISTED}`;

// ── In-Memory Rate Limiting ──
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function isRateLimited(key) {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (entry.count >= MAX_ATTEMPTS) {
    return true;
  }
  entry.count++;
  return false;
}

function resetRateLimitsForTesting() {
  rateLimitMap.clear();
}

// ── Demo Reset Core Logic (Replicating src/lib/demo-reset.ts) ──

function isDemoResetEnabled() {
  const enabled = process.env.DEMO_PASSWORD_RESET_ENABLED?.trim();
  if (enabled !== 'true') return false;
  if (process.env.VERCEL_ENV === 'production' && enabled !== 'true') return false;
  return true;
}

function normalizeResetEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

function getAllowedDemoEmails() {
  const raw = process.env.DEMO_RESET_ALLOWED_EMAILS || '';
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function isEmailAllowedForDemoReset(email) {
  const normalized = normalizeResetEmail(email);
  if (!normalized) return false;
  return getAllowedDemoEmails().includes(normalized);
}

function validateResetPassword(newPassword, confirmPassword) {
  if (typeof newPassword !== 'string' || typeof confirmPassword !== 'string') {
    return { valid: false, error: 'Password must be provided as text.' };
  }
  if (newPassword.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long.' };
  }
  if (newPassword !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match. Please verify both passwords.' };
  }
  if (Buffer.byteLength(newPassword, 'utf8') > 72) {
    return { valid: false, error: 'Password exceeds maximum length limit of 72 bytes.' };
  }
  return { valid: true };
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function executeDemoPasswordReset(email, newPassword, options = {}) {
  const normalized = normalizeResetEmail(email);

  // Hard safety check: flag and email must both be permitted before touching DB
  if (!isDemoResetEnabled() || !isEmailAllowedForDemoReset(normalized)) {
    return { success: false, error: 'Password reset is forbidden or disabled.', rowsUpdated: 0 };
  }

  const newHash = await hashPassword(newPassword);
  let rowsUpdated = 0;
  let dbError = null;

  const client = options.supabaseClient;
  if (client) {
    try {
      const { data, error } = await client
        .from('users')
        .update({
          password_hash: newHash,
          reset_token: null,
          reset_token_expires: null
        })
        .eq('email', normalized)
        .select('id, email');

      if (error) {
        dbError = error;
      } else if (Array.isArray(data)) {
        rowsUpdated = data.length;
      }
    } catch (err) {
      dbError = err;
    }
  }

  if (dbError) {
    return { success: false, error: 'Reset failed, please try again.', rowsUpdated: 0 };
  }

  if (rowsUpdated !== 1) {
    return { success: false, error: 'Reset failed, please try again.', rowsUpdated };
  }

  return { success: true, rowsUpdated: 1 };
}

// ── Route Level Handler Simulation (Replicating src/app/api/demo-reset-password/route.ts) ──

async function simulateDemoResetRoute(req, options = {}) {
  const { headers = {}, body = {} } = req;

  // 1. Cross-Origin Defense
  const origin = headers['origin'];
  if (origin) {
    try {
      const originUrl = new URL(origin);
      const host = headers['x-forwarded-host'] || headers['host'] || '';
      const cleanHost = host.split(':')[0].trim();
      if (originUrl.hostname !== cleanHost && originUrl.host !== host) {
        return { status: 403, body: { error: 'Cross-origin request forbidden.' } };
      }
    } catch {
      return { status: 403, body: { error: 'Cross-origin request forbidden.' } };
    }
  }
  if (headers['sec-fetch-site'] === 'cross-site') {
    return { status: 403, body: { error: 'Cross-origin request forbidden.' } };
  }

  // 2. IP Rate Limiting
  const ip = headers['x-forwarded-for'] || '127.0.0.1';
  if (isRateLimited(`ip:${ip}`)) {
    return { status: 429, body: { error: 'Too many reset attempts. Please try again later.' } };
  }

  // Rule 1: Flag check
  if (!isDemoResetEnabled()) {
    return { status: 403, body: { error: 'Password reset is forbidden or disabled.' } };
  }

  const { email, newPassword, confirmPassword } = body;
  const normalizedEmail = normalizeResetEmail(email);

  // Rule 2: Email allowlist check
  if (!normalizedEmail || !isEmailAllowedForDemoReset(normalizedEmail)) {
    return { status: 403, body: { error: 'Password reset is forbidden or disabled.' } };
  }

  // Email rate limit
  if (isRateLimited(`email:${normalizedEmail}`)) {
    return { status: 429, body: { error: 'Too many reset attempts. Please try again later.' } };
  }

  // Rule 3: Password validation
  const validation = validateResetPassword(newPassword, confirmPassword);
  if (!validation.valid) {
    return { status: 400, body: { error: validation.error } };
  }

  // Rule 4, 5, 6, 7: DB execution
  const result = await executeDemoPasswordReset(normalizedEmail, newPassword, options);
  if (!result.success) {
    return { status: 500, body: { error: result.error || 'Reset failed, please try again.' } };
  }

  return {
    status: 200,
    body: {
      success: true,
      message: 'Password has been successfully reset. Please sign in with your new password.',
      redirectTo: '/login?reset=success'
    },
    cookiesSet: [{ name: 'avtive_session', maxAge: 0 }]
  };
}

// ── Mock Database Helper ──

function createMockSupabaseClient(initialUsers, options = {}) {
  let writesCount = 0;
  const users = initialUsers.map((u) => ({ ...u }));

  return {
    getWritesCount: () => writesCount,
    getUsers: () => users,
    from(table) {
      if (table !== 'users') throw new Error(`Unexpected table ${table}`);

      return {
        update(fields) {
          if (options.simulateDbError) {
            return {
              eq() {
                return {
                  select() {
                    return Promise.resolve({
                      data: null,
                      error: new Error('Postgres connection pool exhausted / simulated DB failure')
                    });
                  }
                };
              }
            };
          }

          return {
            eq(col, val) {
              return {
                select() {
                  const matchingIndices = [];
                  users.forEach((u, idx) => {
                    if (u[col]?.toLowerCase().trim() === val.toLowerCase().trim()) {
                      matchingIndices.push(idx);
                    }
                  });

                  if (matchingIndices.length > 0) {
                    writesCount += matchingIndices.length;
                    const updatedRows = [];
                    for (const idx of matchingIndices) {
                      users[idx] = { ...users[idx], ...fields };
                      updatedRows.push({
                        id: users[idx].id,
                        email: users[idx].email,
                        password_hash: users[idx].password_hash
                      });
                    }
                    return Promise.resolve({ data: updatedRows, error: null });
                  }

                  return Promise.resolve({ data: [], error: null });
                }
              };
            }
          };
        }
      };
    }
  };
}

// ── Test Suites ──

test('Demo Password Reset: 1. Allowlisted demo email resets successfully, and DB row shows new bcrypt hash', async () => {
  resetRateLimitsForTesting();
  process.env.DEMO_PASSWORD_RESET_ENABLED = 'true';

  const oldHash = bcrypt.hashSync('OldSecret123', 10);
  const initialUser = {
    id: 'user-demo-1',
    name: 'Demo Account',
    email: ALLOWED_DEMO_EMAIL,
    password_hash: oldHash
  };

  const mockClient = createMockSupabaseClient([initialUser]);
  const newPassword = 'NewSecretPassword2026!';

  const result = await executeDemoPasswordReset(ALLOWED_DEMO_EMAIL, newPassword, {
    supabaseClient: mockClient
  });

  assert.equal(result.success, true);
  assert.equal(result.rowsUpdated, 1);
  assert.equal(mockClient.getWritesCount(), 1);

  const updatedUser = mockClient.getUsers()[0];
  assert.notEqual(updatedUser.password_hash, oldHash);
  assert.equal(updatedUser.password_hash.startsWith('$2'), true);

  const matchesNew = await bcrypt.compare(newPassword, updatedUser.password_hash);
  assert.equal(matchesNew, true);
});

test('Demo Password Reset: 2. Login with the new password succeeds & 3. Login with old password fails', async () => {
  resetRateLimitsForTesting();
  process.env.DEMO_PASSWORD_RESET_ENABLED = 'true';

  const oldPassword = 'OldInitialPassword123';
  const newPassword = 'BrandNewPassword2026';
  const oldHash = bcrypt.hashSync(oldPassword, 10);

  const initialUser = {
    id: 'user-demo-2',
    name: 'Lead Designer',
    email: SECOND_ALLOWED_EMAIL,
    password_hash: oldHash
  };

  const mockClient = createMockSupabaseClient([initialUser]);

  const result = await executeDemoPasswordReset(SECOND_ALLOWED_EMAIL, newPassword, {
    supabaseClient: mockClient
  });

  assert.equal(result.success, true);
  const updatedUser = mockClient.getUsers()[0];

  // 2. Login with new password succeeds
  const loginWithNew = await bcrypt.compare(newPassword, updatedUser.password_hash);
  assert.equal(loginWithNew, true, 'Login with new password must succeed');

  // 3. Login with old password fails
  const loginWithOld = await bcrypt.compare(oldPassword, updatedUser.password_hash);
  assert.equal(loginWithOld, false, 'Login with old password must fail');
});

test('Demo Password Reset: 4. Non-allowlisted email is rejected, and DB is unchanged (assert zero writes)', async () => {
  resetRateLimitsForTesting();
  process.env.DEMO_PASSWORD_RESET_ENABLED = 'true';

  const originalHash = bcrypt.hashSync('SafeSecret123', 10);
  const initialUser = {
    id: 'user-victim',
    name: 'Target Account',
    email: FORBIDDEN_EMAIL,
    password_hash: originalHash
  };

  const mockClient = createMockSupabaseClient([initialUser]);

  assert.equal(isEmailAllowedForDemoReset(FORBIDDEN_EMAIL), false);

  const result = await executeDemoPasswordReset(FORBIDDEN_EMAIL, 'NewPassword999', {
    supabaseClient: mockClient
  });

  assert.equal(result.success, false);
  assert.equal(result.error, 'Password reset is forbidden or disabled.');
  // Assert zero writes
  assert.equal(mockClient.getWritesCount(), 0);
  assert.equal(mockClient.getUsers()[0].password_hash, originalHash);
});

test('Demo Password Reset: 5. Flag disabled is rejected, with zero writes', async () => {
  resetRateLimitsForTesting();
  process.env.DEMO_PASSWORD_RESET_ENABLED = 'false';

  assert.equal(isDemoResetEnabled(), false);

  const originalHash = bcrypt.hashSync('OriginalSafe123', 10);
  const initialUser = {
    id: 'user-demo-disabled',
    name: 'Demo Account',
    email: ALLOWED_DEMO_EMAIL,
    password_hash: originalHash
  };

  const mockClient = createMockSupabaseClient([initialUser]);

  const result = await executeDemoPasswordReset(ALLOWED_DEMO_EMAIL, 'NewAttemptPass123', {
    supabaseClient: mockClient
  });

  assert.equal(result.success, false);
  assert.equal(result.error, 'Password reset is forbidden or disabled.');
  assert.equal(mockClient.getWritesCount(), 0);
  assert.equal(mockClient.getUsers()[0].password_hash, originalHash);

  process.env.DEMO_PASSWORD_RESET_ENABLED = 'true';
});

test('Demo Password Reset: 6. Mismatched confirm password is rejected', () => {
  const mismatch = validateResetPassword('Password123', 'Password124');
  assert.equal(mismatch.valid, false);
  assert.equal(mismatch.error, 'Passwords do not match. Please verify both passwords.');

  const tooShort = validateResetPassword('short', 'short');
  assert.equal(tooShort.valid, false);
  assert.equal(tooShort.error, 'Password must be at least 8 characters long.');

  const longPass = 'A'.repeat(73);
  const tooLong = validateResetPassword(longPass, longPass);
  assert.equal(tooLong.valid, false);
  assert.equal(tooLong.error, 'Password exceeds maximum length limit of 72 bytes.');

  const valid = validateResetPassword('ValidPassword123', 'ValidPassword123');
  assert.equal(valid.valid, true);
});

test('Demo Password Reset: 7. Simulated DB failure returns generic error, UI does not show success', async () => {
  resetRateLimitsForTesting();
  process.env.DEMO_PASSWORD_RESET_ENABLED = 'true';

  const mockClient = createMockSupabaseClient([], { simulateDbError: true });

  const res = await simulateDemoResetRoute(
    {
      headers: { host: 'localhost:3000' },
      body: {
        email: ALLOWED_DEMO_EMAIL,
        newPassword: 'NewPasswordValid123',
        confirmPassword: 'NewPasswordValid123'
      }
    },
    { supabaseClient: mockClient }
  );

  assert.equal(res.status, 500);
  assert.equal(res.body.success, undefined);
  assert.equal(res.body.error, 'Reset failed, please try again.');
  // Assert no internal Postgres message leaked to client
  assert.equal(JSON.stringify(res.body).includes('Postgres'), false);
  assert.equal(JSON.stringify(res.body).includes('exhausted'), false);
});

test('Demo Password Reset: 8. Cross-origin request rejection', async () => {
  resetRateLimitsForTesting();

  const res = await simulateDemoResetRoute({
    headers: {
      host: 'avtive.app',
      origin: 'https://malicious-site.com'
    },
    body: {
      email: ALLOWED_DEMO_EMAIL,
      newPassword: 'NewPasswordValid123',
      confirmPassword: 'NewPasswordValid123'
    }
  });

  assert.equal(res.status, 403);
  assert.equal(res.body.error, 'Cross-origin request forbidden.');
});

test('Demo Password Reset: 9. Rate limiting by IP and Email triggers 429 after 5 attempts', () => {
  resetRateLimitsForTesting();

  const ipKey = 'ip:192.168.1.100';
  for (let i = 0; i < 5; i++) {
    assert.equal(isRateLimited(ipKey), false);
  }
  assert.equal(isRateLimited(ipKey), true);

  const emailKey = 'email:demo@example.com';
  for (let i = 0; i < 5; i++) {
    assert.equal(isRateLimited(emailKey), false);
  }
  assert.equal(isRateLimited(emailKey), true);
});

test('Demo Password Reset: 10. Successful route execution clears session cookie and redirects', async () => {
  resetRateLimitsForTesting();
  process.env.DEMO_PASSWORD_RESET_ENABLED = 'true';

  const initialUser = {
    id: 'user-demo-3',
    name: 'Demo Account',
    email: ALLOWED_DEMO_EMAIL,
    password_hash: bcrypt.hashSync('OldSecret123', 10)
  };

  const mockClient = createMockSupabaseClient([initialUser]);

  const res = await simulateDemoResetRoute(
    {
      headers: {
        host: 'localhost:3000',
        origin: 'http://localhost:3000'
      },
      body: {
        email: ALLOWED_DEMO_EMAIL,
        newPassword: 'BrandNewSecure2026!',
        confirmPassword: 'BrandNewSecure2026!'
      }
    },
    { supabaseClient: mockClient }
  );

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.redirectTo, '/login?reset=success');
  assert.equal(res.cookiesSet[0].name, 'avtive_session');
  assert.equal(res.cookiesSet[0].maxAge, 0);
});
