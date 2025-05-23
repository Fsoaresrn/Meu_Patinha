import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser } from '@/types';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean; // To handle initial hydration and auth checks
  tempPasswordForcedReset: boolean; // True if user logged in with a temporary password
  login: (user: AuthUser, isTempPassword?: boolean) => void;
  logout: () => void;
  updateUser: (updatedFields: Partial<Omit<AuthUser, 'cpf' | 'temporaryPassword'>>) => void;
  setAcceptedTerms: () => void;
  clearTempPasswordFlag: () => void;
  finishLoading: () => void; // Call this after initial state is determined
  startLoading: () => void;
  setTempPassword: (cpf: string, tempPass: string) => void; // For password recovery simulation
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true, // Start with loading true until hydration/initial check
      tempPasswordForcedReset: false,
      
      login: (user, isTempPassword = false) => {
        set({
          user,
          isAuthenticated: true,
          tempPasswordForcedReset: isTempPassword,
          isLoading: false, // Logged in, no longer loading auth state
        });
      },
      
      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          tempPasswordForcedReset: false, 
          isLoading: false 
        });
        // Optionally clear other user-related persisted data here if not handled by component unmounts
      },
      
      updateUser: (updatedFields) => {
        set((state) => {
          if (state.user) {
            return { user: { ...state.user, ...updatedFields } };
          }
          return {};
        });
      },
      
      setAcceptedTerms: () => {
        set((state) => {
          if (state.user) {
            return { user: { ...state.user, acceptedTerms: true } };
          }
          return {};
        });
      },
      
      clearTempPasswordFlag: () => {
        set({ tempPasswordForcedReset: false });
      },

      finishLoading: () => {
        set({ isLoading: false });
      },
      startLoading: () => {
        set({ isLoading: true });
      },
      setTempPassword: (cpf, tempPass) => {
        // This is a simplified approach for simulation as per requirements.
        // In a real app, this would involve backend communication.
        // We find the user in localStorage (simulating a DB) and update their temp password.
        // This assumes users are stored in a separate localStorage item for this to work.
        // For now, we'll just store it on the user object if they are logged in,
        // or handle it in the recovery form logic.
        // For simplicity, this demo will focus on setting it on the current user if they exist,
        // otherwise this would be handled by the recovery page logic itself.
        set((state) => {
          if (state.user && state.user.cpf === cpf) {
            return { user: { ...state.user, temporaryPassword: tempPass } };
          }
          // If user not logged in, this state change won't apply.
          // The recovery page should handle storing this temp password temporarily.
          return {};
        });
      }
    }),
    {
      name: 'meu-patinha-auth-storage', 
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // This callback is called when rehydration is done.
        // We can now safely say loading is finished.
        if (state) {
          state.finishLoading();
        }
      },
      partialize: (state) => ({ // Only persist these fields
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        tempPasswordForcedReset: state.tempPasswordForcedReset,
      }),
    }
  )
);

// Call finishLoading once after initial hydration if not handled by onRehydrateStorage
// This is a bit of a safety net.
if (typeof window !== 'undefined') {
  useAuthStore.persist.rehydrate().then(() => {
    useAuthStore.getState().finishLoading();
  });
}
