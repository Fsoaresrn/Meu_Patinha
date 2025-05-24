
"use client";

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

interface AuthGuardProps {
  children: ReactNode;
}

const AUTH_ROUTES = ['/login', '/signup', '/recuperar-senha'];
const TERMS_ROUTE = '/terms';

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, isLoading, tempPasswordForcedReset, finishLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading && useAuthStore.persist.hasHydrated()) {
      finishLoading();
    }
  }, [isLoading, finishLoading]);


  useEffect(() => {
    if (isLoading) {
      return; 
    }

    const isAuthRoute = AUTH_ROUTES.includes(pathname);
    const isTermsRoute = pathname === TERMS_ROUTE;

    if (!isAuthenticated && !isAuthRoute) {
      router.replace(`/login?redirect=${pathname}`);
    } else if (isAuthenticated) {
      if (!user?.acceptedTerms && !isTermsRoute && pathname !== '/logout') { 
        router.replace(TERMS_ROUTE);
      } else if (tempPasswordForcedReset && !isTermsRoute && pathname !== '/configuracoes' && pathname !== '/logout') {
        // Force password change if logged in with temporary password
        // Now redirects to /configuracoes
        router.replace('/configuracoes?forcePasswordChange=true');
      } else if (isAuthRoute && pathname !== '/recuperar-senha') { 
        router.replace('/');
      }
    }
  }, [isAuthenticated, user, isLoading, tempPasswordForcedReset, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (isAuthenticated && !user?.acceptedTerms && pathname !== TERMS_ROUTE && pathname !== '/logout') {
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <LoadingSpinner size={48} />
        </div>
    );
  }
  
  if (AUTH_ROUTES.includes(pathname) || pathname === TERMS_ROUTE) {
    return <>{children}</>;
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }
  
  return <>{children}</>;
}

    