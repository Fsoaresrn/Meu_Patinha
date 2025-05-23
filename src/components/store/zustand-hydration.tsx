
'use client';

import { useAuthStore } from '@/stores/auth.store';
import type { AuthState } from '@/stores/auth.store'; // Import AuthState if needed for type safety
import { useEffect } from 'react';

export function ZustandHydration() {
  useEffect(() => {
    // The `onRehydrateStorage` option in `auth.store.ts` and the global rehydrate call
    // are primary mechanisms for calling `finishLoading`.
    // This component uses `onFinishHydration` for an explicit listener.

    const handleFinishHydration = (hydratedState: AuthState | undefined) => {
      // `hydratedState` is the state after hydration, not used here directly
      // but available if needed.
      useAuthStore.getState().finishLoading();
    };

    // Subscribe to the hydration finishing.
    // `onFinishHydration` returns an unsubscribe function.
    const unsubscribe = useAuthStore.persist.onFinishHydration(handleFinishHydration);
    
    // Call immediately if already hydrated (e.g., from cache or synchronous localStorage read)
    // This ensures finishLoading is called even if onFinishHydration fires before this effect.
    if (useAuthStore.persist.hasHydrated()) {
      handleFinishHydration(useAuthStore.getState());
    }

    return () => {
      unsubscribe(); // Cleanup listener on unmount
    };
  }, []); // Empty dependency array ensures this runs once on mount

  return null; // This component doesn't render anything
}
