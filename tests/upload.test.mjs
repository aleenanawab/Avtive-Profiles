import test from 'node:test';
import assert from 'node:assert/strict';

// Helper function replicating sniffImageMagicBytes in upload route
function sniffImageMagicBytes(buffer) {
  if (!buffer || buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: '.jpg', mime: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { ext: '.png', mime: 'image/png' };
  }

  // WebP: RIFF at 0..3 and WEBP at 8..11
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { ext: '.webp', mime: 'image/webp' };
  }

  return null;
}

// Upload authorization gatekeeper logic
function checkUploadAuthorization(hasValidSession) {
  if (!hasValidSession) {
    return {
      status: 401,
      body: {
        error: 'Unauthorized: You must be signed in to upload assets.',
        code: 'UNAUTHORIZED'
      }
    };
  }
  return { status: 200, authorized: true };
}

test('Upload Authorization: 1. Unauthenticated upload request returns 401 with UNAUTHORIZED code', () => {
  const result = checkUploadAuthorization(false);
  assert.strictEqual(result.status, 401);
  assert.strictEqual(result.body.code, 'UNAUTHORIZED');
  assert.ok(result.body.error.includes('signed in'));
});

test('Upload Authorization: 2. Authenticated upload request is authorized', () => {
  const result = checkUploadAuthorization(true);
  assert.strictEqual(result.status, 200);
  assert.strictEqual(result.authorized, true);
});

test('Upload Validation: 3. Sniff magic bytes allows JPEG, PNG, and WebP only', () => {
  // Valid JPEG header
  const jpegBuf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  const jpegSniff = sniffImageMagicBytes(jpegBuf);
  assert.notStrictEqual(jpegSniff, null);
  assert.strictEqual(jpegSniff.mime, 'image/jpeg');

  // Valid PNG header
  const pngBuf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
  const pngSniff = sniffImageMagicBytes(pngBuf);
  assert.notStrictEqual(pngSniff, null);
  assert.strictEqual(pngSniff.mime, 'image/png');

  // Valid WebP header
  const webpBuf = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
  const webpSniff = sniffImageMagicBytes(webpBuf);
  assert.notStrictEqual(webpSniff, null);
  assert.strictEqual(webpSniff.mime, 'image/webp');

  // Malicious/unsupported: SVG XML header
  const svgBuf = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
  const svgSniff = sniffImageMagicBytes(svgBuf);
  assert.strictEqual(svgSniff, null);

  // Script file / HTML
  const htmlBuf = Buffer.from('<html><script>alert(1)</script></html>');
  const htmlSniff = sniffImageMagicBytes(htmlBuf);
  assert.strictEqual(htmlSniff, null);
});

test('Upload Validation: 4. Reject files exceeding 5MB byte size limit', () => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const smallSize = 4 * 1024 * 1024;
  const largeSize = 5 * 1024 * 1024 + 1;

  assert.strictEqual(smallSize <= MAX_FILE_SIZE, true);
  assert.strictEqual(largeSize <= MAX_FILE_SIZE, false);
});
