import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Avatar from './Avatar';

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxFileSize = 5 * 1024 * 1024;

export default function ProfilePhotoSection() {
  const { user, updateUserProfile } = useAuth();
  const fileInput = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    setError('');
    setMessage('');
    if (!file) return;
    if (!allowedTypes.includes(file.type)) {
      setError('Choose a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > maxFileSize) {
      setError('Profile photo must be 5 MB or smaller.');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', file);
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile-image', formData);
      updateUserProfile(data.data.user);
      setMessage('Profile photo updated.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update profile photo.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const { data } = await api.delete('/auth/profile-image');
      updateUserProfile(data.data.user);
      setMessage('Profile photo removed.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to remove profile photo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card p-6">
      <h2 className="text-xl font-semibold text-gray-900">Profile Photo</h2>
      <p className="mt-1 text-sm text-gray-500">Use a JPEG, PNG, or WebP image up to 5 MB.</p>
      <div className="mt-5 flex flex-wrap items-center gap-5">
        <Avatar user={user} className="h-24 w-24" />
        <div className="flex flex-wrap gap-3">
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
            aria-label="Choose a profile photo"
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={loading}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Change Photo'}
          </button>
          {user?.profileImage && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Remove Photo
            </button>
          )}
        </div>
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="mt-4 text-sm text-green-700">{message}</p>}
    </section>
  );
}
