'use client';

import { useAuthStore } from '@/stores/auth.store';
import { useEffect } from 'react';

export function ZustandHydration() {
  useEffect(() => {
    // This effect runs once on the client after initial mount.
    // Zustand's persist middleware rehydrates asynchronously.
    // We ensure finishLoading is called after rehydration is likely complete.
    // The store's isLoading state is initialized to true.
    // The persist middleware's onRehydrateStorage should ideally call finishLoading.
    
    const unsubscribe = useAuthStore.persist.onRehydrateStorage(() => {
      useAuthStore.getState().finishLoading(); // Call finishLoading when rehydration is complete
      unsubscribe(); // Clean up listener
    });
    
    // Fallback if onRehydrateStorage isn't triggered or if store is already hydrated (e.g. from cache)
    // This ensures finishLoading is called if the store was already hydrated by the time this component mounts.
    if (useAuthStore.persist.hasHydrated()) {
        useAuthStore.getState().finishLoading();
        unsubscribe(); // Clean up listener if it was set
    }

    return () => {
      // Cleanup if component unmounts before rehydration
      unsubscribe?.(); 
    };
  }, []);

  return null; // This component doesn't render anything
}
