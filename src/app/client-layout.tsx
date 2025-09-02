'use client';

import { AuthProvider } from '@/lib/simple-auth-context';
import { ReactNode } from 'react';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AuthProvider>
      <div id="root">
        {children}
      </div>
    </AuthProvider>
  );
}