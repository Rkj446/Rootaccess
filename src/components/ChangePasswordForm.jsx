import { useState } from 'react';
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ChangePasswordForm() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      return 'All password fields are required.';
    }

    if (form.newPassword.length < 8) {
      return 'New password must be at least 8 characters.';
    }

    if (form.newPassword !== form.confirmPassword) {
      return 'New password and confirmation do not match.';
    }

    if (form.newPassword === form.currentPassword) {
      return 'New password must be different from the current password.';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await api.put('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });

      setSuccess('Password updated successfully. Redirecting to login...');
      await logout();
      setTimeout(() => navigate('/'), 1200);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary-100 p-2 rounded-lg text-primary-600">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Security</h2>
          <p className="text-sm text-gray-500">Change your password securely</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPasswords.current ? 'text' : 'password'}
              value={form.currentPassword}
              onChange={(event) => handleChange('currentPassword', event.target.value)}
              className="input pl-10 pr-12"
              placeholder="Enter current password"
            />
            <button
              type="button"
              onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              aria-label={showPasswords.current ? 'Hide current password' : 'Show current password'}
            >
              {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPasswords.new ? 'text' : 'password'}
              value={form.newPassword}
              onChange={(event) => handleChange('newPassword', event.target.value)}
              className="input pl-10 pr-12"
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              aria-label={showPasswords.new ? 'Hide new password' : 'Show new password'}
            >
              {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(event) => handleChange('confirmPassword', event.target.value)}
              className="input pl-10 pr-12"
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              aria-label={showPasswords.confirm ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? 'Updating password...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}
