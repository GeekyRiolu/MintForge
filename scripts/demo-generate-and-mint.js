/* eslint-disable @typescript-eslint/no-var-requires */
const { config: loadEnv } = require('dotenv');
const { ethers } = require('ethers');

const { buildMetadata, getDemoConfig } = require('./demo-generate-and-mint.lib.js');

loadEnv({ path: '.env.local' });

const NFT_ABI = [
  'function mint(address to, string metadataURI) payable returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
];

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let json;

  try {
    json = JSON.parse(text);
  } catch (_error) {
    throw new Error(`Expected JSON from ${url}, received: ${text.slice(0, 200)}`);
  }

  if (!response.ok) {
    throw new Error(json.error || `Request failed: ${response.status}`);
  }

  return json;
}

async function main() {
  const prompt = process.argv.slice(2).join(' ').trim();

  if (!prompt) {
    console.error('Usage: node scripts/demo-generate-and-mint.js "your nft prompt"');
    process.exit(1);
  }

  const config = getDemoConfig(process.env);

  if (!config.contractAddress) {
    console.error('Missing contract address. Set NEXT_PUBLIC_NFT_CONTRACT_ADDRESS or CONTRACT_ADDRESS.');
    process.exit(1);
  }

  console.log('Step 1/4: Generating image with Cloudflare...');
  const generation = await postJson(`${config.appUrl}/api/generate-nft-image`, {
    prompt,
  });

  const imageUrl = Array.isArray(generation.images) ? generation.images[0] : '';

  if (!imageUrl) {
    throw new Error('Image generation succeeded but no image URL was returned');
  }

  console.log('  Image generated.');

  console.log('Step 2/4: Uploading image to IPFS...');
  const imageUpload = await postJson(`${config.appUrl}/api/ipfs`, {
    type: 'image',
    imageUrl,
    filename: `ai-nft-${Date.now()}.png`,
  });

  if (!imageUpload.ipfsUrl) {
    throw new Error('IPFS image upload succeeded but no ipfsUrl was returned');
  }

  console.log(`  Image IPFS URI: ${imageUpload.ipfsUrl}`);

  console.log('Step 3/4: Uploading metadata to IPFS...');
  const metadata = buildMetadata({
    prompt,
    imageUri: imageUpload.ipfsUrl,
  });
  const metadataUpload = await postJson(`${config.appUrl}/api/ipfs`, {
    type: 'metadata',
    metadata,
  });

  if (!metadataUpload.ipfsUrl) {
    throw new Error('IPFS metadata upload succeeded but no ipfsUrl was returned');
  }

  console.log(`  Metadata IPFS URI: ${metadataUpload.ipfsUrl}`);

  console.log('Step 4/4: Minting on local chain...');
  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  const signer = new ethers.Wallet(config.privateKey, provider);
  const contract = new ethers.Contract(config.contractAddress, NFT_ABI, signer);

  const tx = await contract.mint(signer.address, metadataUpload.ipfsUrl);
  console.log(`  Transaction submitted: ${tx.hash}`);

  const receipt = await tx.wait();
  const transferEvent = receipt.events?.find((event) => event.event === 'Transfer');
  const tokenId = transferEvent?.args?.tokenId?.toString();

  console.log(`  Confirmed in block: ${receipt.blockNumber}`);

  if (tokenId != null) {
    const tokenUri = await contract.tokenURI(tokenId);
    console.log(`  Token ID: ${tokenId}`);
    console.log(`  On-chain tokenURI: ${tokenUri}`);
  }

  console.log('');
  console.log('Done.');
  console.log(`Prompt: ${prompt}`);
  console.log(`Owner: ${signer.address}`);
}

main().catch((error) => {
  console.error('');
  console.error('Demo failed:', error.message);
  process.exit(1);
});
