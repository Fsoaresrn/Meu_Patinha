import type { ReactNode } from 'react';
import { AuthGuard } from '@/components/auth/auth-guard';
import { AppChrome } from '@/components/layout/app-chrome';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <AppChrome>{children}</AppChrome>
    </AuthGuard>
  );
}
