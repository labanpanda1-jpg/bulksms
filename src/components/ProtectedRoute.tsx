import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { FullPageLoader } from '@/components/ui/States';
import type { ReactNode } from 'react';

export function ProtectedRoute({ children, role }: { children: ReactNode; role?: 'admin' | 'customer' }) {
  const { user, loading } = useAuth();

  if (loading) return <FullPageLoader message="Loading..." />;

  if (!user) return <Navigate to="/login" replace />;

  if (role === 'admin' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/app/dashboard" replace />;
  }

  if (role === 'customer' && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}
