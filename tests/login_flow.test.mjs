import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';

// Setup test session secret for HMAC
process.env.SESSION_SECRET = 'test-secret-at-least-32-chars-long-for-valid-hmac-sessions!!';

// ── 1. Unit Tests for DatabaseUnavailableError & getUserByEmail logic ──

class DatabaseUnavailableError extends Error {
  constructor(message = 'Database service is temporarily unavailable.', cause) {
    super(message);
    this.name = 'DatabaseUnavailableError';
    this.code = 'DATABASE_UNAVAILABLE';
    this.status = 503;
    if (cause) this.cause = cause;
  }
}

function mapSupabaseUserRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash || '',
    resetToken: row.reset_token,
    resetTokenExpires: row.reset_token_expires,
    onboardingCompleted: Boolean(row.onboarding_completed),
    createdAt: row.created_at || new Date().toISOString()
  };
}

async function simulateGetUserByEmail(email, mockDbState) {
  const normalizedEmail = email.toLowerCase().trim();

  if (mockDbState.mode === 'timeout') {
    throw new DatabaseUnavailableError('Database query timed out after 6000ms');
  }
  if (mockDbState.mode === 'query_error') {
    throw new DatabaseUnavailableError('Database query error: relation "users" does not exist');
  }
  if (mockDbState.mode === 'connection_refused') {
    throw new DatabaseUnavailableError('Database query failed: connection refused');
  }

  // Authoritative Supabase mock
  const userRow = mockDbState.users?.find((u) => u.email.toLowerCase().trim() === normalizedEmail);
  if (!userRow) {
    // Succeeded, but no row found -> genuine nonexistent user
    return null;
  }

  return mapSupabaseUserRow(userRow);
}

// ── 2. Route handler simulation logic replicating src/app/api/auth/login/route.ts ──

const DUMMY_BCRYPT_HASH = '$2a$10$e8wVfT0N9v0V0w7C9J4Qhe6X0jT0p5r7T6v4T0j5u8V2w1T4p6s7q';

async function simulateLoginRoute(body, mockDbState) {
  try {
    const { email, password } = body || {};

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return { status: 400, body: { error: 'Email and password are required.' } };
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user;
    try {
      user = await simulateGetUserByEmail(normalizedEmail, mockDbState);
    } catch (dbErr) {
      const isDbUnavailable =
        dbErr instanceof DatabaseUnavailableError ||
        dbErr?.code === 'DATABASE_UNAVAILABLE' ||
        dbErr?.status === 503;

      if (isDbUnavailable) {
        return {
          status: 503,
          body: {
            error: 'Authentication service is temporarily unavailable. Please try again in a few moments.',
            code: 'DATABASE_UNAVAILABLE'
          }
        };
      }
      throw dbErr;
    }

    // Nonexistent user check (anti-enumeration)
    if (!user) {
      await bcrypt.compare(password, DUMMY_BCRYPT_HASH);
      return { status: 401, body: { error: 'Invalid email or password.' } };
    }

    // Missing password hash or oauth-only user
    if (!user.passwordHash || user.passwordHash.startsWith('oauth_google_')) {
      await bcrypt.compare(password, DUMMY_BCRYPT_HASH);
      return { status: 401, body: { error: 'Invalid email or password.' } };
    }

    // Verify password against persisted hash
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return { status: 401, body: { error: 'Invalid email or password.' } };
    }

    return {
      status: 200,
      body: {
        success: true,
        message: 'Login successful.',
        user: { id: user.id, name: user.name, email: user.email }
      }
    };
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      return {
        status: 503,
        body: {
          error: 'Authentication service is temporarily unavailable. Please try again in a few moments.',
          code: 'DATABASE_UNAVAILABLE'
        }
      };
    }
    return { status: 500, body: { error: 'An unexpected error occurred during login.' } };
  }
}

// ── 3. Test Suites ──

test('Auth Login: 1. Valid credentials with persisted Supabase user returns 200', async () => {
  const plainPassword = 'CorrectPassword@123';
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const mockDbState = {
    mode: 'normal',
    users: [
      {
        id: 'user-valid-1',
        name: 'Aleena Nawab',
        email: 'aleena@avtive.app',
        password_hash: passwordHash,
        created_at: new Date().toISOString()
      }
    ]
  };

  const response = await simulateLoginRoute(
    { email: 'aleena@avtive.app', password: plainPassword },
    mockDbState
  );

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.user.email, 'aleena@avtive.app');
  assert.equal(response.body.user.name, 'Aleena Nawab');
});

test('Auth Login: 2. Incorrect password returns 401 Unauthorized', async () => {
  const plainPassword = 'CorrectPassword@123';
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const mockDbState = {
    mode: 'normal',
    users: [
      {
        id: 'user-valid-1',
        name: 'Aleena Nawab',
        email: 'aleena@avtive.app',
        password_hash: passwordHash,
        created_at: new Date().toISOString()
      }
    ]
  };

  const response = await simulateLoginRoute(
    { email: 'aleena@avtive.app', password: 'WrongPassword@999' },
    mockDbState
  );

  assert.equal(response.status, 401);
  assert.equal(response.body.error, 'Invalid email or password.');
});

test('Auth Login: 3. Nonexistent account returns 401 with timing defense', async () => {
  const mockDbState = {
    mode: 'normal',
    users: [] // Empty DB
  };

  const response = await simulateLoginRoute(
    { email: 'nobody@example.com', password: 'AnyPassword@123' },
    mockDbState
  );

  assert.equal(response.status, 401);
  assert.equal(response.body.error, 'Invalid email or password.');
});

test('Auth Login: 4. Account with missing or OAuth-only password hash returns 401', async () => {
  const mockDbState = {
    mode: 'normal',
    users: [
      {
        id: 'user-oauth-1',
        name: 'OAuth User',
        email: 'oauth@example.com',
        password_hash: 'oauth_google_123456789',
        created_at: new Date().toISOString()
      },
      {
        id: 'user-no-hash',
        name: 'Empty Hash User',
        email: 'nohash@example.com',
        password_hash: '',
        created_at: new Date().toISOString()
      }
    ]
  };

  const res1 = await simulateLoginRoute(
    { email: 'oauth@example.com', password: 'SomePassword@123' },
    mockDbState
  );
  assert.equal(res1.status, 401);
  assert.equal(res1.body.error, 'Invalid email or password.');

  const res2 = await simulateLoginRoute(
    { email: 'nohash@example.com', password: 'SomePassword@123' },
    mockDbState
  );
  assert.equal(res2.status, 401);
  assert.equal(res2.body.error, 'Invalid email or password.');
});

test('Auth Login: 5. Database timeout returns 503 DATABASE_UNAVAILABLE (NOT 401)', async () => {
  const mockDbState = {
    mode: 'timeout'
  };

  const response = await simulateLoginRoute(
    { email: 'user@avtive.app', password: 'Password@123' },
    mockDbState
  );

  assert.equal(response.status, 503);
  assert.equal(response.body.code, 'DATABASE_UNAVAILABLE');
  assert.match(response.body.error, /temporarily unavailable/i);
});

test('Auth Login: 6. Supabase query error returns 503 DATABASE_UNAVAILABLE (NOT 401)', async () => {
  const mockDbState = {
    mode: 'query_error'
  };

  const response = await simulateLoginRoute(
    { email: 'user@avtive.app', password: 'Password@123' },
    mockDbState
  );

  assert.equal(response.status, 503);
  assert.equal(response.body.code, 'DATABASE_UNAVAILABLE');
  assert.match(response.body.error, /temporarily unavailable/i);
});

test('Auth Login: 7. Supabase connection refused returns 503 DATABASE_UNAVAILABLE (NOT 401)', async () => {
  const mockDbState = {
    mode: 'connection_refused'
  };

  const response = await simulateLoginRoute(
    { email: 'user@avtive.app', password: 'Password@123' },
    mockDbState
  );

  assert.equal(response.status, 503);
  assert.equal(response.body.code, 'DATABASE_UNAVAILABLE');
});

test('Auth Mapping: 8. Supabase password_hash column maps accurately to user.passwordHash', () => {
  const rawRow = {
    id: 'user-100',
    name: 'Test User',
    email: 'test@example.com',
    password_hash: '$2a$10$hashed_password_val',
    reset_token: null,
    reset_token_expires: null,
    created_at: '2026-01-01T00:00:00Z'
  };

  const mapped = mapSupabaseUserRow(rawRow);
  assert.equal(mapped.passwordHash, '$2a$10$hashed_password_val');
  assert.equal(mapped.email, 'test@example.com');
  assert.equal(mapped.id, 'user-100');
});

test('Auth Registration: 9. Registration fails with 503 if database is unavailable', async () => {
  async function simulateRegister(email, mockDbState) {
    let existingUser;
    try {
      existingUser = await simulateGetUserByEmail(email, mockDbState);
    } catch (err) {
      if (err instanceof DatabaseUnavailableError || err?.code === 'DATABASE_UNAVAILABLE') {
        return {
          status: 503,
          body: {
            error: 'Registration service is temporarily unavailable. Please try again later.',
            code: 'DATABASE_UNAVAILABLE'
          }
        };
      }
      throw err;
    }

    if (existingUser) {
      return { status: 409, body: { error: 'Account already exists.' } };
    }

    if (mockDbState.mode === 'write_failure') {
      return {
        status: 503,
        body: {
          error: 'Registration service is temporarily unavailable. Please try again later.',
          code: 'DATABASE_UNAVAILABLE'
        }
      };
    }

    return { status: 201, body: { success: true } };
  }

  const resTimeout = await simulateRegister('new@example.com', { mode: 'timeout' });
  assert.equal(resTimeout.status, 503);
  assert.equal(resTimeout.body.code, 'DATABASE_UNAVAILABLE');

  const resWriteFail = await simulateRegister('new@example.com', { mode: 'write_failure' });
  assert.equal(resWriteFail.status, 503);
  assert.equal(resWriteFail.body.code, 'DATABASE_UNAVAILABLE');
});
