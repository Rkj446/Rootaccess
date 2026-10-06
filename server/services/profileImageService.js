import crypto from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import User from '../models/User.js';
import { publicUser } from './authService.js';

const profileImagesDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'uploads', 'profile-images');
export const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;
const profileImageTypes = {
  'image/jpeg': {
    extension: 'jpg',
    signature: (buffer) => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
  },
  'image/png': {
    extension: 'png',
    signature: (buffer) => buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  'image/webp': {
    extension: 'webp',
    signature: (buffer) => buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP',
  },
};
const managedProfileImagePath = /^\/uploads\/profile-images\/[0-9a-f-]{36}\.(?:jpg|png|webp)$/;

export const validateProfileImageFile = (file) => {
  if (!file?.buffer || !Buffer.isBuffer(file.buffer)) {
    throw Object.assign(new Error('A profile photo file is required'), { statusCode: 400 });
  }
  if (file.size > MAX_PROFILE_IMAGE_BYTES) {
    throw Object.assign(new Error('Profile photo must be 5 MB or smaller'), { statusCode: 413 });
  }

  const imageType = profileImageTypes[file.mimetype];
  if (!imageType || !imageType.signature(file.buffer)) {
    throw Object.assign(new Error('Upload a valid JPEG, PNG, or WebP image'), { statusCode: 400 });
  }
  return imageType;
};

const removeStoredProfileImage = async (imagePath, ownerId) => {
  if (!managedProfileImagePath.test(imagePath || '')) return;
  try {
    const referencedByAnotherUser = await User.exists({ profileImage: imagePath, _id: { $ne: ownerId } });
    if (referencedByAnotherUser) return;
    await unlink(path.join(profileImagesDirectory, path.basename(imagePath)));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Unable to remove a replaced profile image:', error.message);
    }
  }
};

export const updateProfileImage = async ({ userId, file }) => {
  const imageType = validateProfileImageFile(file);

  const user = await User.findById(userId);
  if (!user || user.status !== 'ACTIVE') {
    throw Object.assign(new Error('Authentication required'), { statusCode: 401 });
  }

  const filename = `${crypto.randomUUID()}.${imageType.extension}`;
  const imagePath = `/uploads/profile-images/${filename}`;
  await mkdir(profileImagesDirectory, { recursive: true });
  await writeFile(path.join(profileImagesDirectory, filename), file.buffer, { flag: 'wx', mode: 0o600 });

  const previousImage = user.profileImage;
  try {
    user.profileImage = imagePath;
    await user.save();
  } catch (error) {
    await removeStoredProfileImage(imagePath, user._id);
    throw error;
  }

  await removeStoredProfileImage(previousImage, user._id);
  return publicUser(user);
};

export const removeProfileImage = async ({ userId }) => {
  const user = await User.findById(userId);
  if (!user || user.status !== 'ACTIVE') {
    throw Object.assign(new Error('Authentication required'), { statusCode: 401 });
  }

  const previousImage = user.profileImage;
  user.profileImage = null;
  await user.save();
  await removeStoredProfileImage(previousImage, user._id);
  return publicUser(user);
};
