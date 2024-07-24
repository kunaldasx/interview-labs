import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

const planNames: Record<string, string> = {
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
  student: 'Placement',
};

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get('plan');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const data = await authAPI.register({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        ...(selectedPlan === 'student' && { role: 'placement_officer' }),
      });
      login(data.access_token, data.user);
      localStorage.setItem('refresh_token', data.refresh_token);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 px-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 -right-40 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 -left-40 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-100/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="mb-4"><span className="text-3xl font-bold text-gradient-vibrant">Hire<span className="text-primary-600">Glint</span></span></div>
          <h1 className="text-2xl font-bold text-gradient-vibrant">Create Account</h1>
          <p className="text-gray-500 mt-1">Register to get started</p>
        </div>

        {selectedPlan && planNames[selectedPlan] && (
          <div className="mb-4 bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 text-center">
            <p className="text-sm text-primary-700">
              You selected the <span className="font-semibold">{planNames[selectedPlan]}</span> plan
            </p>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="full_name"
              label="Full Name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Full Name"
              required
              className="!bg-white !border-gray-300 !text-gray-900 placeholder-gray-400 focus:!border-primary-500"
            />
            <Input
              id="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
              className="!bg-white !border-gray-300 !text-gray-900 placeholder-gray-400 focus:!border-primary-500"
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              className="!bg-white !border-gray-300 !text-gray-900 placeholder-gray-400 focus:!border-primary-500"
            />
            <Input
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Re-enter password"
              required
              className="!bg-white !border-gray-300 !text-gray-900 placeholder-gray-400 focus:!border-primary-500"
            />
            <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
              Sign In
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
