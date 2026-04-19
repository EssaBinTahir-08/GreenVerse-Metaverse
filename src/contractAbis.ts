export const ECO_TOKEN_ABI = [
  "function mint(address to, uint256 amount) public",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address to, uint256 amount) public returns (bool)"
];

export const NFT_TREE_ABI = [
  "function buyTree(string memory uri) public payable returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)"
];
