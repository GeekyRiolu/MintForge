/**
 * Authentication utilities for SIWE and JWT handling
 */

/**
 * Get the current SIWE authentication token from storage
 */
export function getSiweToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('siwe_token');
}

/**
 * Get the current authenticated address from storage
 */
export function getSiweAddress(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('siwe_address');
}

/**
 * Get the current authenticated chain ID from storage
 */
export function getSiweChainId(): number | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const chainId = localStorage.getItem('siwe_chainId');
  return chainId ? parseInt(chainId, 10) : null;
}

/**
 * Clear all authentication data
 */
export function clearSiweAuth(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem('siwe_token');
  localStorage.removeItem('siwe_address');
  localStorage.removeItem('siwe_chainId');
}

/**
 * Check if user is authenticated via SIWE
 */
export function isAuthenticatedViaSiwe(): boolean {
  return getSiweToken() !== null && getSiweAddress() !== null;
}

/**
 * Build auth headers for API requests
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getSiweToken();
  const address = getSiweAddress();
  const chainId = getSiweChainId();

  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (address) {
    headers['X-User-Address'] = address;
  }
  if (chainId) {
    headers['X-Chain-Id'] = chainId.toString();
  }

  return headers;
}
