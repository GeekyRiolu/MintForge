import { useCallback, useEffect, useState } from 'react';
import { useAccount, useNetwork, useSignMessage } from 'wagmi';
import { SiweMessage } from 'siwe';

interface SiweAuthState {
  address: string | null;
  chainId: number | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface UseSiweAuthReturn extends SiweAuthState {
  signIn: () => Promise<void>;
  signOut: () => void;
}

/**
 * Hook for SIWE (Sign-In With Ethereum) authentication
 * Handles nonce generation, message signing, verification, and session management
 */
export function useSiweAuth(): UseSiweAuthReturn {
  const { address, isConnected, chain } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [state, setState] = useState<SiweAuthState>({
    address: null,
    chainId: null,
    token: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  });

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('siwe_token');
    const storedAddress = localStorage.getItem('siwe_address');
    const storedChainId = localStorage.getItem('siwe_chainId');

    if (storedToken && storedAddress) {
      setState(prev => ({
        ...prev,
        token: storedToken,
        address: storedAddress.toLowerCase(),
        chainId: storedChainId ? parseInt(storedChainId, 10) : null,
        isAuthenticated: true,
      }));
    }
  }, []);

  // Clear authentication if wallet disconnected
  useEffect(() => {
    if (!isConnected || !address) {
      setState(prev => ({
        ...prev,
        address: null,
        token: null,
        isAuthenticated: false,
      }));
      localStorage.removeItem('siwe_token');
      localStorage.removeItem('siwe_address');
      localStorage.removeItem('siwe_chainId');
    }
  }, [isConnected, address]);

  const signIn = useCallback(async () => {
    if (!address || !chain) {
      setState(prev => ({
        ...prev,
        error: 'Wallet not connected',
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      // Step 1: Get nonce from backend (local API route)
      const nonceResponse = await fetch('/api/auth/nonce');
      if (!nonceResponse.ok) {
        throw new Error('Failed to get nonce');
      }
      const { nonce } = (await nonceResponse.json()) as { nonce: string };

      // Step 2: Create SIWE message
      const message = new SiweMessage({
        domain: typeof window !== 'undefined' ? window.location.host : '',
        address: address,
        statement: 'Sign in to Mintly.com',
        uri: typeof window !== 'undefined' ? window.location.origin : '',
        version: '1',
        chainId: chain.id,
        nonce: nonce,
        issuedAt: new Date().toISOString(),
        expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      });

      const messageStr = message.prepareMessage();

      // Step 3: Sign message with wallet
      const signature = await signMessageAsync({
        message: messageStr,
      });

      // Step 4: Verify signature on backend (local API route)
      const verifyResponse = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageStr,
          signature: signature,
        }),
      });

      if (!verifyResponse.ok) {
        const errorData = (await verifyResponse.json()) as { error: string };
        throw new Error(errorData.error || 'Verification failed');
      }

      const { token } = (await verifyResponse.json()) as {
        token: string;
        address: string;
        chainId: number;
      };

      // Step 5: Store token and address
      localStorage.setItem('siwe_token', token);
      localStorage.setItem('siwe_address', address.toLowerCase());
      localStorage.setItem('siwe_chainId', chain.id.toString());

      setState(prev => ({
        ...prev,
        token,
        address: address.toLowerCase(),
        chainId: chain.id,
        loading: false,
        isAuthenticated: true,
        error: null,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      console.error('SIWE sign-in error:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, [address, chain, signMessageAsync]);

  const signOut = useCallback(() => {
    localStorage.removeItem('siwe_token');
    localStorage.removeItem('siwe_address');
    localStorage.removeItem('siwe_chainId');
    setState({
      address: null,
      chainId: null,
      token: null,
      loading: false,
      error: null,
      isAuthenticated: false,
    });
  }, []);

  return {
    ...state,
    signIn,
    signOut,
  };
}
