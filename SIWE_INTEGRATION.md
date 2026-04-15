# MetaMask SIWE Integration Guide

This document describes the proper SIWE (Sign-In With Ethereum) authentication integration for the NFT Universe Clone application.

## Overview

The application now uses industry-standard SIWE (Sign-In With Ethereum) authentication with the following features:

- ✅ **SIWE Message Standard** - Follows EIP-4361 standard messages
- ✅ **Nonce System** - Prevents replay attacks with unique nonces
- ✅ **JWT Sessions** - Secure token-based authentication
- ✅ **HTTP-Only Cookies** - Secure session storage
- ✅ **MetaMask Integration** - Native MetaMask wallet support via RainbowKit
- ✅ **Multi-chain Support** - Works across Ethereum, Goerli, and other configured chains
- ✅ **Backward Compatible** - Legacy signature method still works as fallback

## Architecture

### Components

1. **Backend Auth Endpoints** (`pages/api/auth/`)
   - `GET /api/auth/nonce` - Get a nonce for message signing
   - `POST /api/auth/verify` - Verify signed message and issue JWT

2. **Frontend Authentication** 
   - `hooks/useSiweAuth.ts` - Custom hook for SIWE authentication
   - `context/AuthContext.tsx` - Global auth state management
   - `components/elements/MetaMaskSignIn.tsx` - Sign-in button component
   - `utils/auth.ts` - Authentication utilities

3. **Updated Components**
   - `components/elements/WalletRainbowKitButton.tsx` - Integrated SIWE sign-in
   - `graphql/client/GraphQLProvider.tsx` - Uses SIWE tokens in GraphQL headers

## Authentication Flow

### Sign-In Flow (Step-by-Step)

```
User clicks "Sign In with MetaMask"
    ↓
Check if wallet is connected
    ├─ If NOT connected → Open RainbowKit connection modal
    │
    └─ If connected:
        ├─ Request nonce from backend (/api/auth/nonce)
        │  └─ Backend generates unique nonce using SIWE library
        │
        ├─ Create SIWE message with:
        │  ├─ Domain: window.location.host
        │  ├─ Address: User's wallet address
        │  ├─ Statement: "Sign in to Mintly.com"
        │  ├─ URI: window.location.origin
        │  ├─ Chain ID: Current chain
        │  ├─ Nonce: From backend
        │  ├─ Issued At: Current timestamp
        │  └─ Expiration: 7 days from now
        │
        ├─ User signs message in MetaMask
        │  └─ Shows MetaMask signature modal
        │
        ├─ Send signature to backend (/api/auth/verify)
        │  ├─ Backend verifies signature
        │  ├─ Validates SIWE message structure
        │  ├─ Checks message expiry
        │  ├─ Validates nonce (replay protection)
        │  └─ Generates JWT token
        │
        ├─ Store JWT token
        │  ├─ localStorage: siwe_token
        │  ├─ localStorage: siwe_address
        │  ├─ localStorage: siwe_chainId
        │  └─ HTTP-only Cookie: auth_token (server-side)
        │
        └─ Update UI to show "Signed In"
```

## Implementation Details

### Backend Implementation

#### Nonce Endpoint (`/api/auth/nonce`)

```typescript
GET /api/auth/nonce

Response:
{
  "nonce": "7VJmSrMfXh+"
}
```

Features:
- Generates cryptographically secure nonce using SIWE library
- No database required - nonce is embedded in message
- Prevents message replay attacks

#### Verify Endpoint (`/api/auth/verify`)

```typescript
POST /api/auth/verify

Request:
{
  "message": "127.0.0.1:3000 wants you to sign in...",
  "signature": "0x..."
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "address": "0x...",
  "chainId": 1
}
```

Features:
- Verifies SIWE message signature
- Validates message structure and expiry
- Checks nonce for replay protection
- Issues JWT token valid for 7 days
- Sets HTTP-only cookie for additional security

### Frontend Implementation

#### useSiweAuth Hook

```typescript
import { useSiweAuth } from 'hooks/useSiweAuth';

const {
  address,           // User's wallet address
  chainId,           // Connected chain ID
  token,             // JWT token
  loading,           // Loading state
  error,             // Error message
  isAuthenticated,   // Is user logged in?
  signIn,            // Call to sign in
  signOut,           // Call to sign out
} = useSiweAuth();
```

#### AuthContext Hook

```typescript
import { useAuth } from 'context/AuthContext';

const {
  address,
  chainId,
  token,
  loading,
  error,
  isAuthenticated,
  signIn,
  signOut,
  clearError,
} = useAuth();
```

#### MetaMaskSignIn Component

```typescript
import { MetaMaskSignIn } from 'components/elements/MetaMaskSignIn';

export function MyComponent() {
  return (
    <MetaMaskSignIn
      onSignInSuccess={(address, token) => {
        console.log('Signed in as:', address);
      }}
      onSignInError={(error) => {
        console.error('Sign in failed:', error);
      }}
      buttonText="Sign In with MetaMask"
      className="custom-class"
    />
  );
}
```

## Usage Examples

### Example 1: Protected Page with Sign-In

```typescript
import { useAuth } from 'context/AuthContext';
import { MetaMaskSignIn } from 'components/elements/MetaMaskSignIn';

export function ProfilePage() {
  const { isAuthenticated, address } = useAuth();

  if (!isAuthenticated) {
    return (
      <div>
        <h1>Please sign in to view your profile</h1>
        <MetaMaskSignIn />
      </div>
    );
  }

  return (
    <div>
      <h1>Profile for {address}</h1>
      {/* Protected content */}
    </div>
  );
}
```

### Example 2: Using Auth Token in API Calls

```typescript
import { getSiweToken } from 'utils/auth';

async function fetchUserData() {
  const token = getSiweToken();
  
  const response = await fetch('/api/user/data', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return response.json();
}
```

### Example 3: Global Auth Provider Setup

```typescript
// pages/_app.tsx
import { AuthProvider } from 'context/AuthContext';
import { CryptoWalletProvider } from 'context/CryptoWalletContext';

function MyApp({ Component, pageProps }) {
  return (
    <CryptoWalletProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </CryptoWalletProvider>
  );
}

export default MyApp;
```

## Configuration

### Environment Variables

Add to your `.env.local`:

```bash
# Optional: JWT secret (change in production!)
AUTH_JWT_SECRET=your-secret-key-minimum-32-chars

# Optional: Token expiry (default: 7d)
# Examples: 1d, 7d, 30d
AUTH_JWT_EXPIRY=7d
```

### RainbowKit Configuration

The application already has MetaMask configured in `context/CryptoWalletContext.tsx`:

```typescript
metaMaskWallet({ chains, shimDisconnect: true }),
```

This ensures MetaMask is shown as a recommended wallet option.

## Security Considerations

### ✅ Implemented Security Features

1. **Nonce System** - Each signature includes a unique nonce
2. **Message Expiry** - Messages expire after 7 days
3. **Signature Verification** - All signatures verified against recovered address
4. **JWT Expiry** - Tokens expire after 7 days
5. **HTTP-Only Cookies** - Secure session storage
6. **Domain Validation** - Message domain must match request domain
7. **Chain Validation** - Message chain ID validated

### 🔒 Production Recommendations

1. **Change JWT Secret** - Use a strong, random secret in production
2. **Database Nonce Storage** - Implement nonce tracking to prevent reuse
3. **Rate Limiting** - Add rate limiting to auth endpoints
4. **HTTPS Only** - Enforce HTTPS in production
5. **CORS Configuration** - Restrict CORS to allowed domains
6. **Session Timeout** - Consider shorter token expiry (1-3 days)
7. **Refresh Tokens** - Implement refresh token mechanism
8. **Audit Logging** - Log all authentication events

## API Integration

### GraphQL Auth Headers

When authenticated via SIWE, GraphQL requests automatically include:

```
Authorization: Bearer <jwt-token>
X-User-Address: 0x...
X-Chain-Id: 1
```

The GraphQL provider (`graphql/client/GraphQLProvider.tsx`) automatically handles this.

### Making Authenticated Requests

```typescript
import { getAuthHeaders } from 'utils/auth';

// For fetch requests
const headers = {
  'Content-Type': 'application/json',
  ...getAuthHeaders(),
};

const response = await fetch('/api/user', { headers });
```

## Migration from Legacy Authentication

If you're upgrading from the legacy signature system:

1. **No Breaking Changes** - Old signatures still work as fallback
2. **Gradual Migration** - New sign-ins use SIWE automatically
3. **Session Clearing** - Users need to sign in once after update
4. **GraphQL Integration** - Automatically detects SIWE tokens

## Testing

### Test SIWE Sign-In Locally

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Install MetaMask** if not already installed

3. **Create test account** in MetaMask with test funds

4. **Click sign-in button** and approve message in MetaMask

5. **Verify token** is stored:
   ```javascript
   // In browser console
   localStorage.getItem('siwe_token')
   localStorage.getItem('siwe_address')
   ```

### API Testing

```bash
# Get nonce
curl http://localhost:3000/api/auth/nonce

# Verify signature (requires valid message and signature)
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "message": "...",
    "signature": "0x..."
  }'
```

## Troubleshooting

### Issue: "Wallet not connected"
- **Solution**: Click wallet button first to connect via RainbowKit

### Issue: "Invalid nonce"
- **Solution**: Nonce expired, refresh page to get new nonce

### Issue: "Invalid signature"
- **Solution**: Message was modified after signing, try again

### Issue: Token expires too quickly
- Check `JWT_EXPIRY` environment variable
- Increase if needed in `.env.local`

### Issue: MetaMask doesn't show signature modal
- Ensure MetaMask is installed and connected
- Check browser console for errors
- Try refreshing the page

## Support

For issues or questions:

1. Check GraphQL Provider logs
2. Review browser Network tab for API calls
3. Check browser Console for errors
4. Verify SIWE token exists: `localStorage.getItem('siwe_token')`

## References

- [EIP-4361: Sign-In with Ethereum](https://eips.ethereum.org/EIPS/eip-4361)
- [SIWE Library](https://github.com/spruceid/siwe)
- [RainbowKit Documentation](https://www.rainbowkit.com)
- [Wagmi Documentation](https://wagmi.sh)
