import { ethers } from 'hardhat';

async function main() {
  console.log('Deploying AIGeneratedNFT contract...');

  // Get the contract factory
  const AIGeneratedNFT = await ethers.getContractFactory('AIGeneratedNFT');

  // Deploy contract
  const contract = await AIGeneratedNFT.deploy();
  await contract.deployed();

  console.log('AIGeneratedNFT deployed to:', contract.address);

  // Enable public minting (optional - users can mint without permission)
  console.log('Enabling public minting...');
  const tx = await contract.enablePublicMinting();
  await tx.wait();

  console.log('Contract deployment complete!');
  console.log(`\nAdd to .env.local:`);
  console.log(`NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=${contract.address}`);
  console.log(`NEXT_PUBLIC_NFT_CONTRACT_CHAIN_ID=11155111`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
