import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!token) {
      toast.error('Invalid reset link');
      return;
    }
    setIsLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      toast.success('Password reset successfully! Please sign in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Reset failed. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 px-4 relative overflow-hidden">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-primary-200/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

        <div className="w-full max-w-md relative z-10 animate-fade-in-up">
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Invalid Reset Link</h2>
            <p className="text-sm text-gray-500 mb-6">This password reset link is invalid or has expired.</p>
            <Link
              to="/forgot-password"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
            >
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 px-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 -left-40 w-80 h-80 bg-primary-200/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-100/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="HireEZ.AI" className="h-16 object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gradient-vibrant">Reset Password</h1>
          <p className="text-gray-500 mt-1">Enter your new password</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="password"
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              className="!bg-white !border-gray-300 !text-gray-900 placeholder-gray-400 focus:!border-primary-500"
            />
            <Input
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
              minLength={8}
              className="!bg-white !border-gray-300 !text-gray-900 placeholder-gray-400 focus:!border-primary-500"
            />
            <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
              Reset Password
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
