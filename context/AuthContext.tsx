'use client';
import { createContext, useContext, ReactNode, useCallback } from 'react';
import { useSiweAuth } from 'hooks/useSiweAuth';

interface AuthSession {
  address: string | null;
  chainId: number | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthSession {
  signIn: () => Promise<void>;
  signOut: () => void;
  clearError: () => void;
}

const defaultAuthContext: AuthContextType = {
  address: null,
  chainId: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  signIn: async () => {},
  signOut: () => {},
  clearError: () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider component for SIWE authentication
 * Wraps the app to provide global auth state
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const siweAuth = useSiweAuth();

  const clearError = useCallback(() => {
    // Error will clear automatically on next action
    // This is mainly for UI purposes
  }, []);

  const value: AuthContextType = {
    address: siweAuth.address,
    chainId: siweAuth.chainId,
    token: siweAuth.token,
    loading: siweAuth.loading,
    error: siweAuth.error,
    isAuthenticated: siweAuth.isAuthenticated,
    signIn: siweAuth.signIn,
    signOut: siweAuth.signOut,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
