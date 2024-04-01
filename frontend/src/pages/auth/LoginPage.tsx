import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      const data = await authAPI.demoLogin();
      login(data.access_token, data.user);
      localStorage.setItem('refresh_token', data.refresh_token);
      toast.success('Welcome to the demo!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Demo login failed. Please try again.');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await authAPI.login({ email, password });
      login(data.access_token, data.user);
      localStorage.setItem('refresh_token', data.refresh_token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 px-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 -left-40 w-80 h-80 bg-primary-200/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-100/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <span className="text-white font-bold text-xl">AI</span>
          </div>
          <h1 className="text-2xl font-bold text-gradient-vibrant">HireEz</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <div className="glass rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
              Sign In
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-sm"><span className="px-3 bg-white text-gray-400">or</span></div>
          </div>

          <button
            onClick={handleDemoLogin}
            disabled={demoLoading}
            className="w-full py-3 rounded-xl text-sm font-semibold border-2 border-primary-200 text-primary-600 hover:bg-primary-50 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {demoLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading...
              </>
            ) : (
              'Try Demo — No Sign Up Required'
            )}
          </button>

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
