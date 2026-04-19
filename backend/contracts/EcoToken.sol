// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EcoToken
 * @dev ERC20 token for Greenverse eco-rewards. 
 * Minting is restricted to the contract owner (application backend).
 */
contract EcoToken is ERC20, Ownable {
    constructor() ERC20("EcoToken", "ECT") Ownable(msg.sender) {
        // Initial supply for ecosystem liquidity if needed
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    /**
     * @dev Function to mint tokens.
     * @param to The address that will receive the minted tokens.
     * @param amount The amount of tokens to mint.
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
