import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Form';
import { useToast } from '@/hooks/useToast';
import { api } from '@/services/api';

export function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.auth.forgotPassword(email);
      toast(res.message, 'info');
      setSent(true);
    } catch {
      toast('Something went wrong', 'error');
    }
    setLoading(false);
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
            <p className="text-sm text-gray-500 mt-2">If an account exists with {email}, a password reset link has been sent.</p>
            <Link to="/login" className="inline-flex items-center gap-2 mt-6 text-sm text-teal-600 hover:text-teal-700 font-medium">
              <ArrowLeft className="w-4 h-4" /> Back to login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900">Forgot password</h2>
            <p className="text-sm text-gray-500 mt-1">Enter your email to receive a reset link</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Field label="Email Address" required>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" placeholder="you@example.com" required />
                </div>
              </Field>
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Send Reset Link
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-500">
              Remember your password?{' '}
              <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
