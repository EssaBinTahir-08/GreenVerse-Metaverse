// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NFTTree
 * @dev ERC721 NFT for Greenverse Digital Forest.
 * Each NFT represents a real tree planted or preserved.
 */
contract NFTTree is ERC721URIStorage, Ownable {
    uint256 public constant MINT_PRICE = 0.01 ether; 
    uint256 private _nextTokenId;

    constructor() ERC721("Greenverse Tree", "GVT") Ownable(msg.sender) {}

    /**
     * @dev Public function to buy and mint a tree.
     */
    function buyTree(string memory tokenURI) public payable returns (uint256) {
        require(msg.value >= MINT_PRICE, "Insufficient MATIC sent");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        // Forward funds to owner (Greenverse foundation)
        payable(owner()).transfer(msg.value);

        return tokenId;
    }

    /**
     * @dev Admin function to mint a tree (for rewards).
     */
    function mintTree(address player, string memory tokenURI)
        public
        onlyOwner
        returns (uint256)
    {
        uint256 tokenId = _nextTokenId++;
        _safeMint(player, tokenId);
        _setTokenURI(tokenId, tokenURI);

        return tokenId;
    }
}
