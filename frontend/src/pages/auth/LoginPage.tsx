import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(false);
  const tokenAttempted = useRef(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Redirect once auth state is committed (handles all login flows)
  useEffect(() => {
    if (isAuthenticated && user) {
      const dest = user.role === 'candidate' ? '/interviews' : '/dashboard';
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Auto-login via magic token from email link
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token || tokenAttempted.current) return;
    tokenAttempted.current = true;

    setTokenLoading(true);
    authAPI.tokenLogin(token)
      .then((data) => {
        login(data.access_token, data.user);
        localStorage.setItem('refresh_token', data.refresh_token);
        toast.success(`Welcome, ${data.user.full_name}!`);
      })
      .catch(() => {
        toast.error('Login link expired or invalid. Please sign in manually.');
        setTokenLoading(false);
        // Remove token from URL to prevent retry
        setSearchParams({});
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await authAPI.login({ email, password });
      login(data.access_token, data.user);
      localStorage.setItem('refresh_token', data.refresh_token);
      toast.success('Welcome back!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50">
        <div className="text-center">
          <svg className="animate-spin w-8 h-8 mx-auto mb-4 text-primary-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-600 font-medium">Signing you in...</p>
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
          <img src="/logo.png" alt="HireEZ.AI" className="h-14 object-contain mx-auto mb-4" />
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="!bg-white !border-gray-300 !text-gray-900 placeholder-gray-400 focus:!border-primary-500"
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="!bg-white !border-gray-300 !text-gray-900 placeholder-gray-400 focus:!border-primary-500"
            />
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
              Register
            </Link>
          </p>
          <p className="text-center text-sm text-gray-400 mt-2">
            <Link to="/" className="hover:text-gray-600 transition-colors">
              &larr; Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
