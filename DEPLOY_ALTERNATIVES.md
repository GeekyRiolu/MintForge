# Smart Contract Deployment - Alternative Setup

Due to dependency conflicts and Node.js version issues, here's a **simplified approach** using **Foundry** (forge) instead, which is more lightweight:

## Option 1: Deploy via Remix (Easiest - No Local Setup)

1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Create new file: `AIGeneratedNFT.sol`
3. Copy contract from `/contracts/AIGeneratedNFT.sol`
4. Compile (Ctrl+S)
5. Deploy to Sepolia via MetaMask
6. Copy contract address to `.env.local`

## Option 2: Deploy via Foundry (Lightweight Alternative)

```bash
# Install Foundry 
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Create contracts/AIGeneratedNFT.sol with our contract
# Deploy:
forge create contracts/AIGeneratedNFT.sol:AIGeneratedNFT \
  --rpc-url https://sepolia.infura.io/v3/YOUR_KEY \
  --private-key 0xYOUR_PRIVATE_KEY \
  --constructor-args ""
```

## Option 3: Deploy via Etherscan's Code Verification (If Already Deployed)

If you have an existing contract, just verify it on Etherscan.

## Recommended: Use Remix (Quickest)

1. Get test ETH: [faucet.sepolia.dev](https://faucet.sepolia.dev)
2. Copy contract code from our repo
3. Deploy on Remix with MetaMask
4. Add contract address to `.env.local`

**This avoids all the Node.js/npm dependency issues!**
