import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';
import app from '../app.js';

test('profile image mutation endpoints reject unauthenticated requests', async () => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();

  try {
    const uploadBody = new FormData();
    uploadBody.append('profileImage', new Blob(['not an image'], { type: 'application/pdf' }), 'document.pdf');
    const uploadResponse = await fetch(`http://127.0.0.1:${port}/api/auth/profile-image`, {
      method: 'PUT',
      body: uploadBody,
    });
    const removeResponse = await fetch(`http://127.0.0.1:${port}/api/auth/profile-image`, {
      method: 'DELETE',
    });

    assert.equal(uploadResponse.status, 401);
    assert.equal(removeResponse.status, 401);
  } finally {
    server.close();
    await once(server, 'close');
  }
});
