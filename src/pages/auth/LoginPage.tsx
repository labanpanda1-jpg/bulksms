import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Form';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { api } from '@/services/api';

export function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      if (res.success && res.data) {
        login(res.data.token, res.data.user);
        toast('Login successful!', 'success');
        if (res.data.user.role === 'ADMIN' || res.data.user.role === 'SUPER_ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/app/dashboard');
        }
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
    setLoading(false);
  };

  const fillDemo = (type: 'admin' | 'customer') => {
    if (type === 'admin') {
      setEmail('admin@abancool.com');
      setPassword('admin123');
    } else {
      setEmail('customer@abancool.com');
      setPassword('customer123');
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
        <p className="text-sm text-gray-500 mt-1">Sign in to your ABANCOOL account</p>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="Email Address" required>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-10"
                required
              />
            </div>
          </Field>

          <Field label="Password" required>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-teal-600 hover:text-teal-700 font-medium">
            Create one
          </Link>
        </p>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-center text-gray-400 mb-3">Demo credentials</p>
          <div className="flex gap-2">
            <button
              onClick={() => fillDemo('customer')}
              className="flex-1 py-2 px-3 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Customer Demo
            </button>
            <button
              onClick={() => fillDemo('admin')}
              className="flex-1 py-2 px-3 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Admin Demo
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
