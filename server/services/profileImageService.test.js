import assert from 'node:assert/strict';
import test from 'node:test';
import { MAX_PROFILE_IMAGE_BYTES, validateProfileImageFile } from './profileImageService.js';

test('accepts JPEG, PNG, and WebP files with matching signatures', () => {
  const validFiles = [
    { mimetype: 'image/jpeg', buffer: Buffer.from([0xff, 0xd8, 0xff]), size: 3, extension: 'jpg' },
    { mimetype: 'image/png', buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), size: 8, extension: 'png' },
    { mimetype: 'image/webp', buffer: Buffer.from('RIFF----WEBP'), size: 12, extension: 'webp' },
  ];

  for (const file of validFiles) {
    assert.equal(validateProfileImageFile(file).extension, file.extension);
  }
});

test('rejects missing, malformed, spoofed, and unsupported files', () => {
  assert.throws(() => validateProfileImageFile(null), { statusCode: 400 });
  assert.throws(() => validateProfileImageFile({
    mimetype: 'image/jpeg',
    buffer: Buffer.from('not an image'),
    size: 12,
  }), { statusCode: 400 });
  assert.throws(() => validateProfileImageFile({
    mimetype: 'application/pdf',
    buffer: Buffer.from([0xff, 0xd8, 0xff]),
    size: 3,
  }), { statusCode: 400 });
  assert.throws(() => validateProfileImageFile({
    mimetype: 'image/png',
    buffer: Buffer.from([0xff, 0xd8, 0xff]),
    size: 3,
  }), { statusCode: 400 });
});

test('rejects images larger than 5 MB', () => {
  assert.equal(MAX_PROFILE_IMAGE_BYTES, 5 * 1024 * 1024);
  assert.throws(() => validateProfileImageFile({
    mimetype: 'image/jpeg',
    buffer: Buffer.from([0xff, 0xd8, 0xff]),
    size: MAX_PROFILE_IMAGE_BYTES + 1,
  }), { statusCode: 413 });
});
