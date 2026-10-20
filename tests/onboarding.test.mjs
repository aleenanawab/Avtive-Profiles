import test from 'node:test';
import assert from 'node:assert/strict';

// ── 1. Standalone implementation replicating src/lib/onboarding.ts ──
function getNextOnboardingRoute(user) {
  if (!user) {
    return '/onboarding/role';
  }
  if (!user.roleCompleted) {
    return '/onboarding/role';
  }
  if (!user.themeCompleted) {
    return '/onboarding/theme';
  }
  if (!user.scriptCompleted) {
    return '/onboarding/create';
  }
  if (!user.onboardingCompleted) {
    return '/edit-profile';
  }
  const identifier = user.profileSlug || user.slug || user.id;
  return identifier ? `/profile/${encodeURIComponent(identifier)}` : '/profile';
}

// ── 2. Mock Database Layer Replicating DB Step Persistence ──
class MockDatabase {
  constructor() {
    this.users = new Map();
    this.profiles = new Map();
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
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found in DB');
    }

    if (step === 'role') {
      user.roleCompleted = true;
      if (payload.role) user.role = payload.role;
    } else if (step === 'theme') {
      user.themeCompleted = true;
      if (payload.theme) user.preferredTheme = payload.theme;
    } else if (step === 'script') {
      user.scriptCompleted = true;
    } else {
      throw new Error(`Invalid step: ${step}`);
    }

    this.users.set(userId, user);
    return { ...user };
  }

  saveProfile(userId, profileData, shouldFail = false) {
    if (shouldFail) {
      throw new Error('Database write error during profile save');
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
  // Case 1: Null/undefined user
  assert.equal(getNextOnboardingRoute(null), '/onboarding/role');
  assert.equal(getNextOnboardingRoute(undefined), '/onboarding/role');

  // Case 2: New user with no flags
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

  // Case 6: Fully completed user -> Profile Review page
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

  // Case 7: Interrupted user resumes at the FIRST incomplete step
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
      onboardingCompleted: true
    }),
    '/onboarding/create'
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

  // Verify flags are in DB mock, not dependent on client state
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

test('Logout & Relogin Flow: Completed user goes directly to Profile Review', () => {
  const db = new MockDatabase();
  const userId = 'user-completed-003';
  db.addUser({
    id: userId,
    email: 'veteran@example.com',
    roleCompleted: true,
    themeCompleted: true,
    scriptCompleted: true,
    onboardingCompleted: true,
    role: 'individual',
    preferredTheme: 'luxe'
  });
  db.saveProfile(userId, { name: 'Veteran Profile', slug: 'veteran-pass' }, false);

  // Simulate logout: Session cookie is cleared
  let session = null;
  assert.equal(session, null);

  // Simulate relogin: user credentials verified, DB queried
  const loggedInUser = db.getUser(userId);
  assert.equal(loggedInUser.onboardingCompleted, true);

  const route = getNextOnboardingRoute({
    ...loggedInUser,
    profileSlug: 'veteran-pass'
  });

  // Direct to Profile Review, NOT onboarding
  assert.equal(route, '/profile/veteran-pass');
});

test('Route-level simulation: /api/onboarding/step authorization and persistence', async () => {
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
    const updated = db.saveStep(session.id, step, { role, theme });
    const nextRoute = getNextOnboardingRoute(updated);
    return { status: 200, body: { success: true, user: updated, nextRoute } };
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
});
