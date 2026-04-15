// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

/**
 * @title AIGeneratedNFT
 * @notice ERC721 contract for AI-generated NFTs with IPFS metadata support
 * @dev Allows users to mint NFTs referencing IPFS metadata URIs
 */
contract AIGeneratedNFT is ERC721URIStorage, Ownable {
  uint256 private _tokenIdCounter;
  
  // Mint price (optional - set to 0 for free minting)
  uint256 public mintPrice = 0;
  
  // Track whether an address is allowed to mint
  mapping(address => bool) public allowedMinters;
  
  event NFTMinted(address indexed to, uint256 indexed tokenId, string metadataURI);

  constructor() ERC721('AIGeneratedNFT', 'AINFT') Ownable(msg.sender) {
    // Allow contract owner to mint initially
    allowedMinters[msg.sender] = true;
  }

  /**
   * @notice Mint an NFT with IPFS metadata URI
   * @param to Address to receive the NFT
   * @param metadataURI IPFS URI pointing to metadata JSON (e.g., ipfs://QmXxxx)
   * @return tokenId The ID of the minted NFT
   */
  function mint(
    address to,
    string memory metadataURI
  ) public payable returns (uint256) {
    require(msg.value >= mintPrice, 'Insufficient payment');
    require(allowedMinters[msg.sender] || msg.sender == to, 'Not authorized to mint');

    uint256 tokenId = _tokenIdCounter;
    _tokenIdCounter += 1;

    _safeMint(to, tokenId);
    _setTokenURI(tokenId, metadataURI);

    emit NFTMinted(to, tokenId, metadataURI);
    return tokenId;
  }

  /**
   * @notice Allow public minting - callable by contract owner
   */
  function enablePublicMinting() public onlyOwner {
    allowedMinters[address(0)] = true; // Special value indicating public
  }

  /**
   * @notice Check if address can mint
   */
  function canMint(address account) public view returns (bool) {
    return allowedMinters[account] || allowedMinters[address(0)];
  }

  /**
   * @notice Add minter address
   */
  function addMinter(address minter) public onlyOwner {
    allowedMinters[minter] = true;
  }

  /**
   * @notice Remove minter address
   */
  function removeMinter(address minter) public onlyOwner {
    allowedMinters[minter] = false;
  }

  /**
   * @notice Set mint price
   */
  function setMintPrice(uint256 newPrice) public onlyOwner {
    mintPrice = newPrice;
  }

  /**
   * @notice Withdraw contract balance
   */
  function withdraw() public onlyOwner {
    (bool success, ) = msg.sender.call{value: address(this).balance}('');
    require(success, 'Withdrawal failed');
  }

  /**
   * @notice Get total NFTs minted
   */
  function getTotalMinted() public view returns (uint256) {
    return _tokenIdCounter;
  }

  // Override required functions
  function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC721URIStorage)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }

  function tokenURI(uint256 tokenId)
    public
    view
    override(ERC721URIStorage)
    returns (string memory)
  {
    return super.tokenURI(tokenId);
  }

  function _update(address to, uint256 tokenId, address auth)
    internal
    override(ERC721)
    returns (address)
  {
    return super._update(to, tokenId, auth);
  }

  function _increaseBalance(address account, uint128 value) internal override(ERC721) {
    super._increaseBalance(account, value);
  }
}
