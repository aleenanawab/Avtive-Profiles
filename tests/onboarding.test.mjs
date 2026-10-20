import test from 'node:test';
import assert from 'node:assert/strict';

// ── 1. Standalone implementation replicating src/lib/onboarding.ts ──
function getNextOnboardingRoute(user) {
  if (!user) {
    return '/onboarding/role';
  }

  // 1. Direct completed users to Profile Review FIRST before individual step checks.
  // Never send completed users back to Role, Theme, or Script even if an old step flag is false or null.
  if (user.onboardingCompleted) {
    const identifier = user.profileSlug || user.slug || user.id;
    return identifier ? `/profile/${encodeURIComponent(identifier)}` : '/profile';
  }

  // 2. Sequential incomplete user progression: Role -> Theme -> Script -> Profile Editor
  if (!user.roleCompleted) {
    return '/onboarding/role';
  }

  if (!user.themeCompleted) {
    return '/onboarding/theme';
  }

  if (!user.scriptCompleted) {
    return '/onboarding/create';
  }

  return '/edit-profile';
}

class DatabaseUnavailableError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'DatabaseUnavailableError';
    this.status = 503;
    this.code = 'DATABASE_UNAVAILABLE';
    if (cause) this.cause = cause;
  }
}

// ── 2. Mock Database Layer Replicating DB Step Persistence & Supabase Checks ──
class MockDatabase {
  constructor() {
    this.users = new Map();
    this.profiles = new Map();
    this.simulateSchemaColumnMissing = false;
    this.simulateZeroRowsUpdated = false;
  }

  addUser(user) {
    this.users.set(user.id, {
      id: user.id,
      name: user.name || 'Test User',
      email: user.email || 'user@example.com',
      roleCompleted: Boolean(user.roleCompleted),
      themeCompleted: Boolean(user.themeCompleted),
      scriptCompleted: Boolean(user.scriptCompleted),
      onboardingCompleted: Boolean(user.onboardingCompleted),
      role: user.role,
      preferredTheme: user.preferredTheme
    });
  }

  getUser(id) {
    const u = this.users.get(id);
    return u ? { ...u } : null;
  }

  saveStep(userId, step, payload = {}) {
    if (this.simulateSchemaColumnMissing) {
      throw new DatabaseUnavailableError(
        'Database schema mismatch: missing onboarding columns on users table. Please apply supabase/migrations/20261020_onboarding_flags.sql.',
        { code: '42703', message: `column "${step}_completed" of relation "users" does not exist` }
      );
    }

    if (this.simulateZeroRowsUpdated) {
      throw new DatabaseUnavailableError(
        `User with ID ${userId} not found in database. Zero rows updated.`
      );
    }

    const user = this.users.get(userId);
    if (!user) {
      throw new DatabaseUnavailableError(`User with ID ${userId} not found in database.`);
    }

    const cloned = { ...user };

    if (step === 'role') {
      cloned.roleCompleted = true;
      if (payload.role) cloned.role = payload.role;
    } else if (step === 'theme') {
      cloned.themeCompleted = true;
      if (payload.theme) cloned.preferredTheme = payload.theme;
    } else if (step === 'script') {
      cloned.scriptCompleted = true;
    } else {
      throw new Error(`Invalid step: ${step}`);
    }

    this.users.set(userId, cloned);
    return { ...cloned };
  }

  saveProfile(userId, profileData, shouldFail = false) {
    if (shouldFail) {
      throw new DatabaseUnavailableError('Database write error during profile save');
    }
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');

    const profileId = profileData.id || `prof-${Date.now()}`;
    const slug = profileData.slug || `slug-${userId}`;
    const profile = { id: profileId, userId, slug, ...profileData };
    this.profiles.set(profileId, profile);

    // Profile save sets onboardingCompleted = true in the same server operation
    user.roleCompleted = true;
    user.themeCompleted = true;
    user.scriptCompleted = true;
    user.onboardingCompleted = true;
    this.users.set(userId, user);

    return { profile, user: { ...user } };
  }
}

// ── Tests ──

test('Onboarding Helper: All combinations of getNextOnboardingRoute', () => {
  // Case 1: Null/undefined user -> Role page
  assert.equal(getNextOnboardingRoute(null), '/onboarding/role');
  assert.equal(getNextOnboardingRoute(undefined), '/onboarding/role');

  // Case 2: New user with no flags -> Role page
  assert.equal(getNextOnboardingRoute({}), '/onboarding/role');
  assert.equal(getNextOnboardingRoute({ roleCompleted: false }), '/onboarding/role');

  // Case 3: Step 1 completed -> Theme page
  assert.equal(
    getNextOnboardingRoute({ roleCompleted: true, themeCompleted: false }),
    '/onboarding/theme'
  );

  // Case 4: Step 2 completed -> Script page (/onboarding/create)
  assert.equal(
    getNextOnboardingRoute({ roleCompleted: true, themeCompleted: true, scriptCompleted: false }),
    '/onboarding/create'
  );

  // Case 5: Step 3 completed -> Profile Editor (/edit-profile)
  assert.equal(
    getNextOnboardingRoute({
      roleCompleted: true,
      themeCompleted: true,
      scriptCompleted: true,
      onboardingCompleted: false
    }),
    '/edit-profile'
  );

  // Case 6: Fully completed user -> Profile Review page (direct by slug or ID)
  assert.equal(
    getNextOnboardingRoute({
      roleCompleted: true,
      themeCompleted: true,
      scriptCompleted: true,
      onboardingCompleted: true,
      profileSlug: 'aleena-pro'
    }),
    '/profile/aleena-pro'
  );

  assert.equal(
    getNextOnboardingRoute({
      roleCompleted: true,
      themeCompleted: true,
      scriptCompleted: true,
      onboardingCompleted: true,
      id: 'usr-999'
    }),
    '/profile/usr-999'
  );

  // Case 7: Completed user with missing/false step flags MUST STILL land on Profile Review (NOT sent back to Role/Theme)
  assert.equal(
    getNextOnboardingRoute({
      roleCompleted: false, // Old/missing column in DB
      themeCompleted: false,
      scriptCompleted: false,
      onboardingCompleted: true,
      profileSlug: 'veteran-user'
    }),
    '/profile/veteran-user'
  );

  // Case 8: Interrupted user resumes at the FIRST incomplete step
  assert.equal(
    getNextOnboardingRoute({
      roleCompleted: false,
      themeCompleted: true,
      scriptCompleted: true,
      onboardingCompleted: false
    }),
    '/onboarding/role'
  );

  assert.equal(
    getNextOnboardingRoute({
      roleCompleted: true,
      themeCompleted: false,
      scriptCompleted: true,
      onboardingCompleted: false
    }),
    '/onboarding/theme'
  );

  assert.equal(
    getNextOnboardingRoute({
      roleCompleted: true,
      themeCompleted: true,
      scriptCompleted: false,
      onboardingCompleted: false
    }),
    '/onboarding/create'
  );
});

test('Onboarding Database Check: Missing database column returns 503 and rejects update without mutations', () => {
  const db = new MockDatabase();
  const userId = 'user-schema-err-001';
  db.addUser({ id: userId, email: 'schema@example.com', roleCompleted: false });

  // Simulate missing column (42703) in Supabase
  db.simulateSchemaColumnMissing = true;

  assert.throws(
    () => {
      db.saveStep(userId, 'role', { role: 'individual' });
    },
    (err) => {
      assert.equal(err instanceof DatabaseUnavailableError, true);
      assert.equal(err.status, 503);
      assert.equal(err.code, 'DATABASE_UNAVAILABLE');
      assert.match(err.message, /missing onboarding columns/);
      return true;
    }
  );

  // Assert ZERO writes/mutations occurred
  const unchangedUser = db.getUser(userId);
  assert.equal(unchangedUser.roleCompleted, false);
  assert.equal(unchangedUser.role, undefined);
});

test('Onboarding Database Check: Zero-row update is rejected as database unavailable', () => {
  const db = new MockDatabase();
  const userId = 'user-zero-row-002';
  db.addUser({ id: userId, email: 'zero@example.com' });

  // Simulate Supabase update returning zero rows (e.g. user missing from users table)
  db.simulateZeroRowsUpdated = true;

  assert.throws(
    () => {
      db.saveStep(userId, 'theme', { theme: 'cyber' });
    },
    (err) => {
      assert.equal(err instanceof DatabaseUnavailableError, true);
      assert.equal(err.status, 503);
      assert.match(err.message, /Zero rows updated/);
      return true;
    }
  );
});

test('Sequential New User Flow: Role -> Theme -> Script -> Editor in DB', () => {
  const db = new MockDatabase();
  const userId = 'user-seq-001';
  db.addUser({ id: userId, email: 'newbie@example.com' });

  // Initial state: fresh user
  let user = db.getUser(userId);
  assert.equal(getNextOnboardingRoute(user), '/onboarding/role');
  assert.equal(user.roleCompleted, false);

  // Step 1: Save Role server-side
  user = db.saveStep(userId, 'role', { role: 'individual' });
  assert.equal(user.roleCompleted, true);
  assert.equal(user.role, 'individual');
  assert.equal(getNextOnboardingRoute(user), '/onboarding/theme');

  // Step 2: Save Theme server-side
  user = db.saveStep(userId, 'theme', { theme: 'cyber' });
  assert.equal(user.themeCompleted, true);
  assert.equal(user.preferredTheme, 'cyber');
  assert.equal(getNextOnboardingRoute(user), '/onboarding/create');

  // Step 3: Save Script server-side
  user = db.saveStep(userId, 'script');
  assert.equal(user.scriptCompleted, true);
  assert.equal(getNextOnboardingRoute(user), '/edit-profile');

  // Verify flags are in DB, not dependent on client state
  const persistedUser = db.getUser(userId);
  assert.equal(persistedUser.roleCompleted, true);
  assert.equal(persistedUser.themeCompleted, true);
  assert.equal(persistedUser.scriptCompleted, true);
  assert.equal(persistedUser.onboardingCompleted, false);
});

test('Profile Save: Sets onboardingCompleted on success, does NOT set on failure', () => {
  const db = new MockDatabase();
  const userId = 'user-save-002';
  db.addUser({
    id: userId,
    email: 'save-test@example.com',
    roleCompleted: true,
    themeCompleted: true,
    scriptCompleted: true,
    onboardingCompleted: false
  });

  // Attempt 1: Profile save fails
  assert.throws(() => {
    db.saveProfile(userId, { name: 'Failed Profile' }, true);
  }, /Database write error/);

  // Completion flag MUST remain false
  let user = db.getUser(userId);
  assert.equal(user.onboardingCompleted, false);
  assert.equal(getNextOnboardingRoute(user), '/edit-profile');

  // Attempt 2: Profile save succeeds
  const { profile } = db.saveProfile(userId, { name: 'Success Profile', slug: 'my-slug' }, false);
  user = db.getUser(userId);
  assert.equal(user.onboardingCompleted, true);
  assert.equal(getNextOnboardingRoute({ ...user, profileSlug: profile.slug }), '/profile/my-slug');
});

test('Completed-User Login: User with onboardingCompleted=true goes directly to Profile Review, even with missing old step flags', () => {
  const db = new MockDatabase();
  const userId = 'user-completed-003';
  // User with onboarding completed in profiles/users, but roleCompleted was false in legacy DB
  db.addUser({
    id: userId,
    email: 'veteran@example.com',
    roleCompleted: false, // Old step flag false
    themeCompleted: false, // Old step flag false
    scriptCompleted: false,
    onboardingCompleted: true,
    role: 'individual',
    preferredTheme: 'luxe'
  });
  db.saveProfile(userId, { name: 'Veteran Profile', slug: 'veteran-pass' }, false);

  // Simulate login lookup
  const loggedInUser = db.getUser(userId);
  assert.equal(loggedInUser.onboardingCompleted, true);

  const route = getNextOnboardingRoute({
    ...loggedInUser,
    profileSlug: 'veteran-pass'
  });

  // Direct to Profile Review, NOT sent back to Role or Theme
  assert.equal(route, '/profile/veteran-pass');
});

test('Route-level simulation: /api/onboarding/step authorization, persistence, and 503 handling', async () => {
  const db = new MockDatabase();
  const userId = 'user-route-004';
  db.addUser({ id: userId, email: 'route@example.com' });

  // Simulate route handler
  async function simulateStepRoute(session, body) {
    if (!session || !session.id) {
      return { status: 401, body: { error: 'Authentication required.' } };
    }
    const { step, role, theme } = body || {};
    if (!['role', 'theme', 'script'].includes(step)) {
      return { status: 400, body: { error: 'Invalid step' } };
    }
    try {
      const updated = db.saveStep(session.id, step, { role, theme });
      const nextRoute = getNextOnboardingRoute(updated);
      return { status: 200, body: { success: true, user: updated, nextRoute } };
    } catch (err) {
      if (err instanceof DatabaseUnavailableError) {
        return { status: 503, body: { error: err.message, code: err.code } };
      }
      return { status: 500, body: { error: err.message } };
    }
  }

  // 1. Unauthenticated request returns 401
  const unauthRes = await simulateStepRoute(null, { step: 'role', role: 'individual' });
  assert.equal(unauthRes.status, 401);

  // 2. Authenticated session saves role step
  const authRes1 = await simulateStepRoute({ id: userId }, { step: 'role', role: 'individual' });
  assert.equal(authRes1.status, 200);
  assert.equal(authRes1.body.user.roleCompleted, true);
  assert.equal(authRes1.body.nextRoute, '/onboarding/theme');

  // 3. Authenticated session saves theme step
  const authRes2 = await simulateStepRoute({ id: userId }, { step: 'theme', theme: 'editorial' });
  assert.equal(authRes2.status, 200);
  assert.equal(authRes2.body.user.themeCompleted, true);
  assert.equal(authRes2.body.nextRoute, '/onboarding/create');

  // 4. Authenticated session saves script step
  const authRes3 = await simulateStepRoute({ id: userId }, { step: 'script' });
  assert.equal(authRes3.status, 200);
  assert.equal(authRes3.body.user.scriptCompleted, true);
  assert.equal(authRes3.body.nextRoute, '/edit-profile');

  // 5. Database failure returns 503 with exact error
  db.simulateSchemaColumnMissing = true;
  const failRes = await simulateStepRoute({ id: userId }, { step: 'theme', theme: 'luxe' });
  assert.equal(failRes.status, 503);
  assert.equal(failRes.body.code, 'DATABASE_UNAVAILABLE');
  assert.match(failRes.body.error, /missing onboarding columns/);
});
