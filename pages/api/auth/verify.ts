import { withSentry } from '@sentry/nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import { SiweMessage } from 'siwe';
import { verifyMessage } from 'ethers/lib/utils';
import jwt from 'jsonwebtoken';

interface VerifyRequest {
  message: string;
  signature: string;
}

interface VerifyResponse {
  token: string;
  address: string;
  chainId: number;
}

interface ErrorResponse {
  error: string;
}

const JWT_SECRET = process.env.AUTH_JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d'; // 7 days

/**
 * Verify SIWE signed message and issue JWT token
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyResponse | ErrorResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message: messageStr, signature } = req.body as VerifyRequest;

  // Validate input
  if (!messageStr || !signature) {
    return res.status(400).json({ error: 'Missing message or signature' });
  }

  try {
    // Parse the SIWE message
    const message = new SiweMessage(messageStr);

    // Verify the signature
    const address = verifyMessage(messageStr, signature);

    // Validate that the recovered address matches the message address
    if (address.toLowerCase() !== message.address.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Validate message expiry (optional - SIWE message should have expiration time)
    if (message.expirationTime && new Date(message.expirationTime) < new Date()) {
      return res.status(401).json({ error: 'Message has expired' });
    }

    // Validate nonce to prevent replay attacks
    // In production, you should check if this nonce has been used before
    // and store used nonces in a database
    if (!message.nonce) {
      return res.status(401).json({ error: 'Invalid nonce' });
    }

    // Validate domain and origin
    const origin = req.headers.origin || req.headers.referer?.split('/').slice(0, 3).join('/');
    if (message.domain !== new URL(origin || '').hostname) {
      console.warn(`Domain mismatch: ${message.domain} !== ${new URL(origin || '').hostname}`);
      // Allow for now, but consider enforcing this in production
    }

    // Create JWT token
    const token = jwt.sign(
      {
        address: address.toLowerCase(),
        chainId: message.chainId,
        nonce: message.nonce,
        issuedAt: Math.floor(Date.now() / 1000),
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    // Set secure HTTP-only cookie (for web requests)
    res.setHeader(
      'Set-Cookie',
      `auth_token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
    );

    // Set cache headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    return res.status(200).json({
      token,
      address: address.toLowerCase(),
      chainId: message.chainId,
    });
  } catch (error) {
    console.error('Error verifying SIWE message:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify signature';
    return res.status(401).json({ error: errorMessage });
  }
}

export default withSentry(handler);
