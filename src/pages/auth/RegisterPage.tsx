import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building2, Phone, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Form';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { api } from '@/services/api';

export function RegisterPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '', business_name: '', email: '', phone: '', password: '', password_confirmation: '', terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.full_name) e.full_name = 'Full name is required';
    if (!form.business_name) e.business_name = 'Business name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.phone) e.phone = 'Phone number is required';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.password_confirmation) e.password_confirmation = 'Passwords do not match';
    if (!form.terms) e.terms = 'You must accept the terms';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.auth.register({
        full_name: form.full_name,
        business_name: form.business_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        password_confirmation: form.password_confirmation,
        terms_accepted: form.terms,
      });
      if (res.success && res.data) {
        login(res.data.token, res.data.user);
        toast(res.message, 'success');
        navigate('/app/dashboard');
      } else {
        toast(res.message, 'error');
      }
    } catch (err: any) {
      toast(err.message || 'Registration failed', 'error');
    }
    setLoading(false);
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
        <p className="text-sm text-gray-500 mt-1">Get 5 free SMS credits on registration</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="Full Name" required error={errors.full_name}>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input value={form.full_name} onChange={e => set('full_name', e.target.value)} className="pl-10" placeholder="John Mwangi" />
            </div>
          </Field>

          <Field label="Business Name" required error={errors.business_name}>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input value={form.business_name} onChange={e => set('business_name', e.target.value)} className="pl-10" placeholder="Mwangi Electronics" />
            </div>
          </Field>

          <Field label="Email Address" required error={errors.email}>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="pl-10" placeholder="you@example.com" />
            </div>
          </Field>

          <Field label="Phone Number" required error={errors.phone} hint="Use format: 0712345678 or 254712345678">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input value={form.phone} onChange={e => set('phone', e.target.value)} className="pl-10" placeholder="0712345678" />
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Password" required error={errors.password}>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} className="pl-10 pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>
            <Field label="Confirm Password" required error={errors.password_confirmation}>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input type={showPassword ? 'text' : 'password'} value={form.password_confirmation} onChange={e => set('password_confirmation', e.target.value)} className="pl-10" placeholder="••••••••" />
              </div>
            </Field>
          </div>

          <div>
            <label className="flex items-start gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={form.terms} onChange={e => set('terms', e.target.checked)} className="mt-0.5 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
              <span>I agree to the <a href="#" className="text-teal-600 hover:underline">Terms of Service</a> and <a href="#" className="text-teal-600 hover:underline">Privacy Policy</a></span>
            </label>
            {errors.terms && <p className="text-xs text-red-500 mt-1">{errors.terms}</p>}
          </div>

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
