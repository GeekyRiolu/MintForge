'use client';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useSiweAuth } from 'hooks/useSiweAuth';
import { useCallback, useEffect, useState } from 'react';
import { tw } from 'utils/tw';

interface MetaMaskSignInProps {
  onSignInSuccess?: (address: string, token: string) => void;
  onSignInError?: (error: string) => void;
  showLabel?: boolean;
  className?: string;
  buttonText?: string;
}

/**
 * MetaMask Sign-In Button Component
 * Handles SIWE authentication flow
 */
export function MetaMaskSignIn({
  onSignInSuccess,
  onSignInError,
  showLabel = true,
  className = '',
  buttonText = 'Sign In with MetaMask',
}: MetaMaskSignInProps) {
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { signIn, loading, error, isAuthenticated, token } = useSiweAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Trigger sign-in callback when authenticated
  useEffect(() => {
    if (isAuthenticated && token && address && !isSigningIn) {
      onSignInSuccess?.(address, token);
    }
  }, [isAuthenticated, token, address, onSignInSuccess, isSigningIn]);

  // Trigger error callback when error occurs
  useEffect(() => {
    if (error) {
      onSignInError?.(error);
    }
  }, [error, onSignInError]);

  const handleClick = useCallback(async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }

    if (isAuthenticated) {
      // Already signed in
      return;
    }

    setIsSigningIn(true);
    try {
      await signIn();
    } finally {
      setIsSigningIn(false);
    }
  }, [isConnected, isAuthenticated, openConnectModal, signIn]);

  // If already authenticated, show success state
  if (isAuthenticated && token) {
    return (
      <div
        className={tw(
          'flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700 border border-green-200',
          className
        )}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span className="text-sm font-medium">Signed In</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading || isSigningIn}
      className={tw(
        'flex items-center gap-2 px-4 py-2 rounded-lg',
        'bg-yellow-300 text-black font-medium',
        'hover:bg-yellow-400 active:bg-yellow-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-colors duration-200',
        className
      )}
      type="button"
    >
      {(loading || isSigningIn) && (
        <svg
          className="animate-spin"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="4.22" y1="4.22" x2="7.07" y2="7.07" />
          <line x1="16.93" y1="16.93" x2="19.78" y2="19.78" />
          <line x1="2" y1="12" x2="6" y2="12" />
          <line x1="18" y1="12" x2="22" y2="12" />
          <line x1="4.22" y1="19.78" x2="7.07" y2="16.93" />
          <line x1="16.93" y1="7.07" x2="19.78" y2="4.22" />
        </svg>
      )}
      {showLabel && (
        <span>{isConnected ? (loading || isSigningIn ? 'Signing...' : buttonText) : 'Connect Wallet'}</span>
      )}
    </button>
  );
}
