# 🚀 Contract Deployment Guide

This guide walks through deploying the `AIGeneratedNFT` contract to Sepolia testnet.

## Prerequisites

1. **Node.js** (v14+)
2. **Hardhat** (Ethereum development environment)
3. **Test ETH on Sepolia** (get from [faucet](https://faucet.sepolia.dev/))
4. **Infura or Alchemy API key** (for Sepolia RPC)

## Setup Steps

### 1. Install Hardhat and Dependencies

```bash
npm install --save-dev hardhat @openzeppelin/contracts ethers
# or
yarn add --dev hardhat @openzeppelin/contracts ethers
```

### 2. Initialize Hardhat Project

```bash
npx hardhat
```

Select: **Create a TypeScript project** → Yes to all prompts

### 3. Create `hardhat.config.ts`

Replace the generated `hardhat.config.ts` with:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

export default config;
```

### 4. Create `.env` File

```bash
# Get from: https://www.infura.io/
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Your wallet's private key (DO NOT COMMIT THIS FILE)
# Export: MetaMask → Account Details → Export Private Key
PRIVATE_KEY=0x...your_private_key...
```

⚠️ **SECURITY**: Add `.env` to `.gitignore`

### 5. Deploy Contract

```bash
npx hardhat run scripts/deploy-nft.ts --network sepolia
```

You'll see output like:
```
Deploying AIGeneratedNFT contract...
AIGeneratedNFT deployed to: 0x1234567890abcdef...
Enabling public minting...
Contract deployment complete!

Add to .env.local:
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x1234567890abcdef...
NEXT_PUBLIC_NFT_CONTRACT_CHAIN_ID=11155111
```

### 6. Verify Setup

Check contract on [Sepolia Etherscan](https://sepolia.etherscan.io/):
- Search for your contract address
- View transactions and holder count

## Next: Update Frontend `.env.local`

After deployment, add to `/home/lucifer/Work/nft-universe-clone/.env.local`:

```bash
# IPFS Configuration
NEXT_PUBLIC_IPFS_PROVIDER=nft-storage
NEXT_PUBLIC_NFT_STORAGE_KEY=eyJ...

# Contract Configuration
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_NFT_CONTRACT_CHAIN_ID=11155111
```

## Get Test ETH

Need test ETH to pay for gas?
- [Sepolia Faucet](https://faucet.sepolia.dev/)
- [Infura Faucet](https://www.infura.io/faucet/sepolia)

## Verify Your Contract

Optional: Verify contract source on Etherscan

```bash
npx hardhat verify --network sepolia "0xYourContractAddress"
```

## Testing Before Production

1. ✅ Deploy to Sepolia
2. ✅ Test mint via frontend
3. ✅ View NFT on OpenSea Testnet
4. ✅ Verify metadata on IPFS
5. ✅ Then deploy to mainnet

## Common Issues

### "Invalid RPC URL"
- Check INFURA_KEY is correct
- Ensure .env file is in root directory

### "Insufficient funds"
- Get more test ETH from faucet
- Check ETH balance: `etherscan.io`

### "Private key error"
- Export from MetaMask correctly
- Remove `0x` prefix if not already there
- Don't use account with real funds!

## Next Steps

1. Get SEPOLIA_RPC_URL from Infura
2. Export private key from MetaMask
3. Create `.env` file
4. Run deployment script
5. Update frontend `.env.local`
6. Start minting! 🎉
