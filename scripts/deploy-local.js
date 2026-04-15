const hre = require('hardhat');

async function main() {
  console.log('🚀 Deploying AIGeneratedNFT contract to localhost...\n');

  // Get the contract factory
  const AIGeneratedNFT = await hre.ethers.getContractFactory('AIGeneratedNFT');

  // Deploy contract
  const contract = await AIGeneratedNFT.deploy();
  await contract.deployed();

  console.log('✅ AIGeneratedNFT deployed to:', contract.address);

  // Enable public minting
  console.log('\n⏳ Enabling public minting...');
  
  // Check if enablePublicMinting function exists
  const tx = await contract.enablePublicMinting?.() || null;
  if (tx) {
    await tx.wait();
    console.log('✅ Public minting enabled');
  } else {
    console.log('ℹ️  Public minting already enabled or function not available');
  }

  console.log('\n✅ Contract deployment complete!');
  console.log('\n📝 UPDATE YOUR .env.local WITH:\n');
  console.log(`NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=${contract.address}`);
  console.log(`NEXT_PUBLIC_NFT_CONTRACT_CHAIN_ID=31337`);
  
  console.log('\n🎉 You can now mint NFTs locally!');
  console.log('   Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
