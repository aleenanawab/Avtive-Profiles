import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

// Setup test environment secret
const TEST_SECRET = 'test-secret-that-is-at-least-32-characters-long-for-hmac!!';
process.env.SESSION_SECRET = TEST_SECRET;

// ── Standalone edge verifier replicating verifySessionTokenEdge ──
async function verifySessionTokenEdge(token, secret) {
  if (!token) return { status: 'missing' };
  if (!secret || secret.length < 32) {
    return { status: 'config_error', error: 'Missing or short secret' };
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 2) return { status: 'invalid' };

    const [payloadB64, sigB64] = parts;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const base64 = sigB64.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
    const binStr = atob(padded);
    const sigBin = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) {
      sigBin[i] = binStr.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify('HMAC', key, sigBin, encoder.encode(payloadB64));
    if (!isValid) return { status: 'invalid' };

    const payloadPadded = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const payloadPad = payloadPadded.length % 4;
    const payloadStr = atob(payloadPad ? payloadPadded + '='.repeat(4 - payloadPad) : payloadPadded);
    const payload = JSON.parse(payloadStr);

    if (!payload || !payload.id || !payload.exp) return { status: 'invalid' };
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return { status: 'expired' };
    }

    return { status: 'valid', payload };
  } catch {
    return { status: 'invalid' };
  }
}

// ── Node token generator replicating createSessionToken ──
function createToken(payload, secret, customExp) {
  const data = {
    ...payload,
    exp: customExp !== undefined ? customExp : Math.floor(Date.now() / 1000) + 3600
  };
  const payloadB64 = Buffer.from(JSON.stringify(data)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
  return `${payloadB64}.${sig}`;
}

// ── Node token verifier replicating verifySessionToken ──
function verifyTokenNode(token, secret) {
  if (!token) return null;
  if (!secret || secret.length < 32) {
    const err = new Error('Server configuration error: SESSION_SECRET is missing or invalid.');
    err.statusCode = 500;
    err.code = 'SERVER_CONFIGURATION_ERROR';
    throw err;
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadBase64, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadBase64)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
    if (!payload || !payload.id || !payload.exp) return null;

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return payload;
  } catch (err) {
    if (err.statusCode === 500) throw err;
    return null;
  }
}

test('Authentication: 1. Missing session cookie handling', async () => {
  const edgeResult = await verifySessionTokenEdge(undefined, TEST_SECRET);
  assert.strictEqual(edgeResult.status, 'missing');

  const edgeResultEmpty = await verifySessionTokenEdge('', TEST_SECRET);
  assert.strictEqual(edgeResultEmpty.status, 'missing');

  const nodeResult = verifyTokenNode(undefined, TEST_SECRET);
  assert.strictEqual(nodeResult, null);
});

test('Authentication: 2. Valid session cookie verification', async () => {
  const user = { id: 'user-valid-123', name: 'John Doe', email: 'john@example.com' };
  const token = createToken(user, TEST_SECRET);

  const edgeResult = await verifySessionTokenEdge(token, TEST_SECRET);
  assert.strictEqual(edgeResult.status, 'valid');
  assert.strictEqual(edgeResult.payload.id, user.id);
  assert.strictEqual(edgeResult.payload.email, user.email);

  const nodeResult = verifyTokenNode(token, TEST_SECRET);
  assert.notStrictEqual(nodeResult, null);
  assert.strictEqual(nodeResult.id, user.id);
});

test('Authentication: 3. Expired session cookie rejection', async () => {
  const user = { id: 'user-expired-123', name: 'Expired User', email: 'exp@example.com' };
  const pastTime = Math.floor(Date.now() / 1000) - 300; // 5 minutes ago
  const token = createToken(user, TEST_SECRET, pastTime);

  const edgeResult = await verifySessionTokenEdge(token, TEST_SECRET);
  assert.strictEqual(edgeResult.status, 'expired');

  const nodeResult = verifyTokenNode(token, TEST_SECRET);
  assert.strictEqual(nodeResult, null);
});

test('Authentication: 4. Invalid or tampered session cookie signature rejection', async () => {
  const user = { id: 'user-legit-123', name: 'Legit', email: 'legit@example.com' };
  const token = createToken(user, TEST_SECRET);

  // Tamper with payload
  const [payloadB64, sig] = token.split('.');
  const forgedPayload = Buffer.from(JSON.stringify({ id: 'user-hacker-999', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
  const tamperedToken = `${forgedPayload}.${sig}`;

  const edgeResultTampered = await verifySessionTokenEdge(tamperedToken, TEST_SECRET);
  assert.strictEqual(edgeResultTampered.status, 'invalid');

  const nodeResultTampered = verifyTokenNode(tamperedToken, TEST_SECRET);
  assert.strictEqual(nodeResultTampered, null);

  // Tamper with signature
  const brokenSigToken = `${payloadB64}.tamperedSignatureHere12345`;
  const edgeResultBroken = await verifySessionTokenEdge(brokenSigToken, TEST_SECRET);
  assert.strictEqual(edgeResultBroken.status, 'invalid');

  const nodeResultBroken = verifyTokenNode(brokenSigToken, TEST_SECRET);
  assert.strictEqual(nodeResultBroken, null);
});

test('Authentication: 5. Server configuration failure handles missing secret as 500, NOT 401', async () => {
  const user = { id: 'user-test-123', email: 'test@example.com' };
  const token = createToken(user, TEST_SECRET);

  // Missing or short secret in production
  const edgeResultNoSecret = await verifySessionTokenEdge(token, '');
  assert.strictEqual(edgeResultNoSecret.status, 'config_error');

  assert.throws(
    () => verifyTokenNode(token, ''),
    (err) => err.statusCode === 500 && err.code === 'SERVER_CONFIGURATION_ERROR'
  );
});
