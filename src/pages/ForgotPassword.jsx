import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, KeyRound, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import rootaccessLogo from '../assets/Rootaccess_logo.jpeg';

const stages = {
  request: 'request',
  verify: 'verify',
  reset: 'reset',
  success: 'success',
};

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [stage, setStage] = useState(stages.request);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const resetState = () => {
    setError('');
    setMessage('');
  };

  const handleRequestCode = async (event) => {
    event.preventDefault();
    resetState();
    setLoading(true);

    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      const devOtp = data?.data?.otp;
      setMessage(
        devOtp
          ? `Development OTP: ${devOtp}. Use it to complete the reset flow.`
          : data.message
      );
      setStage(stages.verify);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to send the reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (event) => {
    event.preventDefault();
    resetState();
    setLoading(true);

    try {
      await api.post('/auth/verify-otp', { email, otp });
      setMessage('Verification code accepted. Please choose a new password.');
      setStage(stages.reset);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Invalid or expired verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    resetState();

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/auth/reset-password', { email, otp, password });
      setMessage(data.message);
      setStage(stages.success);
      setTimeout(() => navigate('/'), 1800);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to reset the password');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    if (stage === stages.request) {
      return (
        <form onSubmit={handleRequestCode} className="space-y-5">
          <div>
            <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="input pl-11"
                placeholder="your.email@example.com"
                required
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Sending code...' : 'Send verification code'}
          </button>
        </form>
      );
    }

    if (stage === stages.verify) {
      return (
        <form onSubmit={handleVerifyCode} className="space-y-5">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Enter 6-digit code
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input pl-11 tracking-[0.35em] text-center"
                placeholder="123456"
                required
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Verifying...' : 'Verify code'}
          </button>
        </form>
      );
    }

    if (stage === stages.reset) {
      return (
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
              New password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="input pl-11 pr-12"
                placeholder="At least 8 characters"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide new password' : 'Show new password'}
                aria-pressed={showPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm new password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="input pl-11 pr-12"
                placeholder="Re-enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((visible) => !visible)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                aria-pressed={showConfirmPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>
      );
    }

    return (
      <div className="text-center space-y-4">
        <CheckCircle2 className="mx-auto w-12 h-12 text-green-500" />
        <p className="text-lg font-semibold text-gray-900">Password reset complete</p>
        <p className="text-sm text-gray-600">Redirecting you back to sign in...</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-6 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <img src={rootaccessLogo} alt="Rootaccess logo" className="h-12 w-20 rounded-lg object-cover" />
            <div className="text-left">
              <p className="text-xl font-bold leading-tight text-gray-900">EduTrack</p>
              <p className="text-xs text-gray-500">by Rootaccess</p>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Password Recovery</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
            {message}
          </div>
        )}

        {renderForm()}

        <div className="mt-6 text-center text-sm text-gray-600">
          Remembered your password?{' '}
          <Link to="/" className="font-medium text-primary-600 hover:text-primary-700">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
