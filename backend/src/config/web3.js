/**
 * ABIs for the Greenverse smart contracts.
 * Replace these with your actual compiled JSON ABIs.
 */

// ERC20 Token ABI (Minimal for minting)
const ECO_TOKEN_ABI = [
    "function mint(address to, uint256 amount) public",
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
];

// ERC721 NFT ABI (Minimal for minting)
const NFT_TREE_ABI = [
    "function mintTree(address to, string memory uri) public returns (uint256)",
    "function buyTree(string memory uri) public payable returns (uint256)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function tokenURI(uint256 tokenId) view returns (string)"
];

module.exports = {
    ECO_TOKEN_ABI,
    NFT_TREE_ABI
};
