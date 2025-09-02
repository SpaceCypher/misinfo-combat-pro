'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/simple-auth-context';
import LoadingSpinner from './loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/auth/signin',
  requireAuth = true 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        router.push(redirectTo);
      } else if (!requireAuth && user) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router, redirectTo, requireAuth]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Authenticating..." />;
  }

  if (requireAuth && !user) {
    return <LoadingSpinner fullScreen text="Redirecting to sign in..." />;
  }

  if (!requireAuth && user) {
    return <LoadingSpinner fullScreen text="Redirecting to dashboard..." />;
  }

  return <>{children}</>;
}