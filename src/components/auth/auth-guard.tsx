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
    // Ensure loading state is properly set after hydration
    // Zustand's persist middleware handles rehydration. isLoading should be false after that.
    // If persist.onRehydrateStorage is working, this might be redundant, but good for safety.
    if (isLoading && useAuthStore.persist.hasHydrated()) {
      finishLoading();
    }
  }, [isLoading, finishLoading]);


  useEffect(() => {
    if (isLoading) {
      return; // Wait for auth state to load
    }

    const isAuthRoute = AUTH_ROUTES.includes(pathname);
    const isTermsRoute = pathname === TERMS_ROUTE;

    if (!isAuthenticated && !isAuthRoute) {
      router.replace(`/login?redirect=${pathname}`);
    } else if (isAuthenticated) {
      if (!user?.acceptedTerms && !isTermsRoute && pathname !== '/logout') { // Allow logout
        router.replace(TERMS_ROUTE);
      } else if (tempPasswordForcedReset && !isTermsRoute && pathname !== '/meu-cadastro' && pathname !== '/logout') {
        // Force password change if logged in with temporary password
        // Assuming /meu-cadastro has the password change functionality
        router.replace('/meu-cadastro?forcePasswordChange=true');
      } else if (isAuthRoute && pathname !== '/recuperar-senha') { 
        // If authenticated and on a login/signup page (but not recovery if mid-process), redirect to home
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

  // If authenticated and terms not accepted, and not on terms page, show minimal content or redirect handled by useEffect
  if (isAuthenticated && !user?.acceptedTerms && pathname !== TERMS_ROUTE && pathname !== '/logout') {
     // This case should be caught by useEffect redirect. Show loading or null until redirect happens.
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <LoadingSpinner size={48} />
        </div>
    );
  }
  
  // If on an auth page or terms page, render children directly (e.g. Login form, Terms form)
  if (AUTH_ROUTES.includes(pathname) || pathname === TERMS_ROUTE) {
    return <>{children}</>;
  }

  // If authenticated and terms accepted (or on a path that doesn't require terms yet, like logout), render app content
  if (isAuthenticated) {
    return <>{children}</>;
  }
  
  // Fallback for non-authenticated users trying to access protected routes (should be caught by redirect)
  // Or if on an auth route already.
  return <>{children}</>;
}
