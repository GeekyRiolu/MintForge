import type { NextRequest } from 'next/server';

const BLOCKED_COUNTRIES = ['CU', 'IR', 'KP', 'SY', 'RU'];

export function middleware(req: NextRequest) {
  const country = req.geo.country || 'US';

  if (BLOCKED_COUNTRIES.includes(country)) {
    return new Response('NFT.com is not available in your location', { status: 403 });
  }
}