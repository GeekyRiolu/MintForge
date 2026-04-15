#!/bin/bash

# SIWE Integration Setup Script

echo "🔐 MetaMask SIWE (Sign-In With Ethereum) Integration Setup"
echo "=========================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Installation complete!"
echo ""
echo "📋 Configuration Steps:"
echo "========================"
echo ""
echo "1. Add to your .env.local:"
echo ""
echo "   # JWT Configuration (optional - defaults will be used)"
echo "   AUTH_JWT_SECRET=your-secret-key-change-in-production"
echo "   AUTH_JWT_EXPIRY=7d"
echo ""

echo "2. Update _app.tsx to include AuthProvider:"
echo ""
echo "   import { AuthProvider } from 'context/AuthContext';"
echo ""
echo "   function MyApp({ Component, pageProps }) {"
echo "     return ("
echo "       <CryptoWalletProvider>"
echo "         <AuthProvider>"
echo "           <Component {...pageProps} />"
echo "         </AuthProvider>"
echo "       </CryptoWalletProvider>"
echo "     );"
echo "   }"
echo ""

echo "3. Start your dev server:"
echo ""
echo "   npm run dev"
echo ""

echo "4. Test the integration:"
echo "   - Open http://localhost:3000 (or your dev URL)"
echo "   - Click 'Sign In' button"
echo "   - Connect your MetaMask wallet"
echo "   - Approve the signature request in MetaMask"
echo "   - You should be signed in!"
echo ""

echo "📚 Documentation:"
echo "   See SIWE_INTEGRATION.md for detailed documentation"
echo ""

echo "🚀 Ready to use SIWE authentication!"
