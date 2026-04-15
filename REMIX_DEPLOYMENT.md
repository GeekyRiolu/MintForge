# Deploy Contract on Remix ✅

The contract has been updated to work with Remix. Here's the step-by-step guide:

## Step 1: Go to Remix
Open [remix.ethereum.org](https://remix.ethereum.org)

## Step 2: Create the Contract File
1. In the left sidebar, click the **File Explorer** icon (folder icon)
2. Click **Create new file**
3. Name it: `AIGeneratedNFT.sol`

## Step 3: Copy Contract Code
1. Copy the entire content from `/contracts/AIGeneratedNFT.sol` in this repo
2. Paste it into the Remix editor

## Step 4: Compile
1. Click the **Solidity Compiler** icon (hammer icon) in left sidebar
2. Select compiler version: **0.8.20** (or any 0.8.x version)
3. Click **Compile AIGeneratedNFT.sol**
4. Verify: No red errors should appear ✓

## Step 5: Deploy to Sepolia
1. Click **Deploy & run transactions** icon (laptop icon)
2. Under "Environment", select **"Injected Provider - MetaMask"**
3. **Make sure MetaMask is connected to Sepolia testnet**
4. Under "CONTRACT", select **AIGeneratedNFT**
5. Click **Deploy**
6. Approve in MetaMask popup

## Step 6: Get Your Contract Address
After deployment:
1. In Remix, scroll down to "Deployed Contracts"
2. Copy the contract address (starts with `0x`)
3. Example: `0x1234567890abcdef1234567890abcdef12345678`

## Step 7: Update `.env.local`
Add to your `.env.local` file:
```bash
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS_HERE
NEXT_PUBLIC_NFT_CONTRACT_CHAIN_ID=11155111
```

## Step 8: Enable Public Minting (Optional)
In Remix, under your deployed contract:
1. Find function `enablePublicMinting`
2. Click the button to allow anyone to mint
3. Approve in MetaMask

## ✅ Done! Your contract is deployed and ready to mint!

Now you can:
- Visit `/generate-with-ai`
- Generate an AI image
- Click "Mint NFT"
- Sign with MetaMask
- Watch it mint! 🎉

## Troubleshooting

### MetaMask says "Sepolia not found"
→ Add Sepolia to MetaMask:
  - Open MetaMask
  - Networks → Add network
  - Network name: Sepolia
  - RPC: https://sepolia.infura.io/v3/YOUR_KEY
  - Chain ID: 11155111

### Need test ETH?
→ Get from faucet: [faucet.sepolia.dev](https://faucet.sepolia.dev)

### Compilation error?
→ Make sure compiler version is **0.8.20** or later
