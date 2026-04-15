import { withSentry } from '@sentry/nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import { generateNonce } from 'siwe';

interface NonceResponse {
  nonce: string;
}

interface ErrorResponse {
  error: string;
}

/**
 * Get a nonce for SIWE authentication
 * Used to generate a unique message for the user to sign
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NonceResponse | ErrorResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Generate a unique nonce using the SIWE library
    const nonce = generateNonce();
    
    // Set cache headers to prevent nonce reuse
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.status(200).json({ nonce });
  } catch (error) {
    console.error('Error generating nonce:', error);
    return res.status(500).json({ error: 'Failed to generate nonce' });
  }
}

export default withSentry(handler);
