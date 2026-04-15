# 🎓 NFT Minting App - Teacher Demo Guide

## **Complete Workshop: From Blockchain to NFT Minting**

### **Part 1: Start the Local Blockchain (Terminal 1)**

```bash
# Terminal 1 - Start hardhat local blockchain
cd ~/Work/nft-universe-clone
npx hardhat node
```

**Show your teacher:**
- ✅ "HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/"
- ✅ 20 test accounts with 10,000 ETH each (100% free, no real money)
- ✅ Accounts available immediately for testing

**Talking Point:** "This is a local blockchain - completely isolated, no real money involved. Perfect for testing and development."

---

### **Part 2: Deploy Smart Contract (Terminal 2)**

```bash
# Terminal 2 - Deploy NFT contract to LOCAL blockchain
cd ~/Work/nft-universe-clone
npx hardhat run scripts/deploy-local.js --network localhost
```

**Expected Output:**
```
🚀 Deploying AIGeneratedNFT contract to localhost...
✅ AIGeneratedNFT deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
✅ Public minting enabled

📝 UPDATE YOUR .env.local WITH:
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_NFT_CONTRACT_CHAIN_ID=31337
```

**Show your teacher:**
- ✅ Contract deployed successfully
- ✅ Specific contract address generated
- ✅ Public minting already enabled (anyone can mint)
- ✅ Check Terminal 1 - you'll see the deployment transaction!

**Talking Point:** "The smart contract is now live on the blockchain. It's an ERC721 NFT contract - the same standard used by OpenSea, Blur, etc."

---

### **Part 3: Start the Web App (Terminal 3)**

```bash
# Terminal 3 - Start Next.js development server
cd ~/Work/nft-universe-clone
npm run dev
```

**Expected Output:**
```
✓ Ready in 2.5s
- Local: http://localhost:8080
```

**Show your teacher:**
- ✅ Next.js app running on http://localhost:8080
- ✅ Compiled all modules successfully
- ✅ App is live and ready to test

---

### **Part 4: Open the App in Browser**

1. Open browser to: **http://localhost:8080**
2. Show the landing page
3. Point out the wallet connect button

---

### **Part 5: Connect Test Wallet (Browser)**

#### **Option A: Using MetaMask (Easiest)**

1. **Import Test Account into MetaMask:**
   - Click MetaMask extension → Account Options → Import Account
   - Enter Private Key of Account #0:
     ```
     0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
     ```
   - Name it "Test Account #0"

2. **Switch MetaMask to Localhost Network:**
   - MetaMask → Networks dropdown → Add Network
   - Network Name: `Localhost 31337`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Save

3. **Connect Wallet in App:**
   - Click "Connect Wallet" button
   - Select MetaMask
   - Approve connection
   - You'll see: `0xf39Fd...92266` connected ✅

**Show your teacher:**
- ✅ Wallet successfully connected
- ✅ Balance shows: 10000 ETH (test crypto)
- ✅ Account address visible

**Talking Point:** "Notice we have 10,000 ETH - completely free testnet tokens. This is what developers use to test without spending real money."

---

### **Part 6: Mint Your First NFT**

#### **Option A: Via Web UI (If UI has Mint Button)**
1. Look for "Mint" or "Create NFT" button on the app
2. Click it
3. You might need to provide metadata URI (will use placeholder: `ipfs://QmTest123`)
4. Approve the transaction in MetaMask
5. Wait for confirmation

#### **Option B: Via Script (Most Reliable)**

**Create a mint script:**
```bash
cat > /tmp/quick-mint.js << 'EOF'
const { ethers } = require('ethers');

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const RPC_URL = 'http://127.0.0.1:8545';
const PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

const ABI = [
  'function mint(address to, string memory metadataURI) public payable returns (uint256)',
  'function balanceOf(address owner) public view returns (uint256)'
];

async function mint() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  console.log('👤 Account:', signer.address);
  console.log('🔗 Contract:', CONTRACT_ADDRESS);
  console.log('');

  // Check balance before
  let balance = await contract.balanceOf(signer.address);
  console.log('📊 NFTs owned BEFORE:', balance.toString());

  // Mint new NFT
  console.log('🎨 Minting NFT...');
  const tx = await contract.mint(
    signer.address,
    'ipfs://QmTest123456789'
  );
  console.log('✅ Minted! Transaction:', tx.hash);

  // Wait for confirmation
  console.log('⏳ Waiting for confirmation...');
  const receipt = await tx.wait();
  console.log('✅ Confirmed in block:', receipt.blockNumber);

  // Check balance after
  balance = await contract.balanceOf(signer.address);
  console.log('📊 NFTs owned AFTER:', balance.toString());
  console.log('');
  console.log('🎉 SUCCESS! NFT minted and confirmed on blockchain!');
}

mint().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
EOF

# Run the mint script
cd ~/Work/nft-universe-clone
npx hardhat run /tmp/quick-mint.js --network localhost
```

**Watch the magic happen:**
```
👤 Account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
🔗 Contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3

📊 NFTs owned BEFORE: 0
🎨 Minting NFT...
✅ Minted! Transaction: 0x1234...
⏳ Waiting for confirmation...
✅ Confirmed in block: 3
📊 NFTs owned AFTER: 1

🎉 SUCCESS! NFT minted and confirmed on blockchain!
```

---

### **Part 7: Verify on Blockchain (Show Terminal Output)**

Check Terminal 1 (hardhat node) - it will show:
```
eth_sendTransaction
  Contract call:       AIGeneratedNFT#mint
  Transaction:         0x1234...
  From:                0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
  To:                  0x5fbdb2315678afecb367f032d93f642f64180aa3
  Value:               0 ETH
  Gas used:            108,423 of 160,000
  Block #3:            0xabcd...
```

**Show your teacher:**
- ✅ Transaction recorded on blockchain
- ✅ Gas fees shown (0 ETH for testing, but would show real cost on mainnet)
- ✅ Block number incremented
- ✅ All transaction details visible

**Talking Point:** "This is a real blockchain transaction! It's immutable - permanently recorded. Same process happens on Ethereum mainnet, but costs real money."

---

### **Part 8: Deploy to Web (Optional - Next Step)**

To make it accessible online, you can deploy to Vercel:

```bash
git add .
git commit -m "Working NFT minting app with local blockchain"
git push

# Then go to vercel.com and import the repository
```

---

## **Summary for Teacher Presentation**

### **Technologies Demonstrated:**
- ✅ **Smart Contracts** (Solidity ERC721)
- ✅ **Local Blockchain** (Hardhat)
- ✅ **Web3 Integration** (ethers.js, Wagmi, RainbowKit)
- ✅ **Frontend** (React, Next.js)
- ✅ **Wallet Integration** (MetaMask)
- ✅ **Full-Stack Web3 App**

### **Key Concepts**
1. **Smart Contract**: Code that runs on blockchain (AIGeneratedNFT.sol)
2. **Blockchain**: Distributed ledger (Hardhat local node)
3. **Wallet**: App that signs transactions (MetaMask)
4. **Transaction**: Action recorded on blockchain (mint)
5. **NFT**: Unique token on blockchain (ERC721)

### **Impressive Points**
- 💰 No real money needed (testnet only)
- ⚡ Instant transactions (local blockchain)
- 🔐 Cryptographically signed
- 📊 Transparent & immutable record
- 🌐 Production-ready technology

---

## **Troubleshooting**

### **Hardhat node won't start**
```bash
# Kill any running processes
pkill -f "hardhat node"

# Start fresh
npx hardhat node
```

### **Contract already deployed**
```bash
# That's fine! Just use the existing address
# Or start fresh hardhat node (it resets)
```

### **MetaMask connection issues**
- Make sure RPC URL is: `http://127.0.0.1:8545`
- Make sure Chain ID is: `31337`
- Refresh the page after changing MetaMask network

### **Transaction fails**
- Check account has enough ETH (it should - 10,000)
- Check contract address is correct
- Check private key is valid

---

## **Quick Command Reference**

```bash
# All-in-One Demo (Run each in different terminal)

# Terminal 1: Blockchain
npx hardhat node

# Terminal 2: Deploy Contract
npx hardhat run scripts/deploy-local.js --network localhost

# Terminal 3: Web App
npm run dev

# Then mint via script or UI!
```

**Total Time: ~5-10 minutes for full demo** ⏱️

---

Good luck with your presentation! 🚀
