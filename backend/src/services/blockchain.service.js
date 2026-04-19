const { ethers } = require('ethers');
const { TokenTx, NFTTree } = require('../models');
const { ECO_TOKEN_ABI, NFT_TREE_ABI } = require('../config/web3');

// --- Configuration ---
const PROVIDER_URL = process.env.RPC_URL;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const ECO_TOKEN_ADDRESS = process.env.ECO_TOKEN_ADDRESS;
const NFT_TREE_ADDRESS = process.env.NFT_TREE_ADDRESS;

// Initialize Web3 if configuration is present
let provider, adminWallet, tokenContract, nftContract;
let isWeb3Ready = false;

if (PROVIDER_URL && ADMIN_PRIVATE_KEY && ECO_TOKEN_ADDRESS && NFT_TREE_ADDRESS) {
    try {
        provider = new ethers.JsonRpcProvider(PROVIDER_URL);
        adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
        tokenContract = new ethers.Contract(ECO_TOKEN_ADDRESS, ECO_TOKEN_ABI, adminWallet);
        nftContract = new ethers.Contract(NFT_TREE_ADDRESS, NFT_TREE_ABI, adminWallet);
        isWeb3Ready = true;
        console.log('[Web3 Service] Real blockchain integration initialized.');
    } catch (error) {
        console.error('[Web3 Service Error] Initialization failed:', error.message);
    }
} else {
    console.warn('[Web3 Service] Missing environment variables. Running in MOCK mode.');
}

/**
 * Issues EcoTokens to a user's wallet.
 */
const issueEcoTokens = async (user, amount, submissionId) => {
    try {
        console.log(`[Web3 Service] Processing ${amount} Eco Tokens for ${user.displayName}...`);

        let txHash;

        if (isWeb3Ready && user.walletAddress) {
            // --- REAL BLOCKCHAIN CALL ---
            const decimals = 18; // Standard
            const amountInWei = ethers.parseUnits(amount.toString(), decimals);
            
            console.log(`[Web3 Service] Sending real transaction to ${user.walletAddress}...`);
            const tx = await tokenContract.mint(user.walletAddress, amountInWei);
            const receipt = await tx.wait();
            txHash = receipt.hash;
        } else {
            // --- MOCK FALLBACK ---
            await new Promise(resolve => setTimeout(resolve, 1500));
            txHash = `0x-mock-${Math.random().toString(16).substr(2, 32)}`;
            console.log(`[Web3 Service] Mock transaction successful. Hash: ${txHash}`);
        }

        // 1. Record the transaction in PostgreSQL
        await TokenTx.create({
            userId: user.id,
            amount: amount,
            submissionId: submissionId,
            txHash: txHash,
            status: 'Completed'
        });

        // 2. Update User's cached ecoScore attribute
        await user.increment('ecoScore', { by: amount });

        return txHash;

    } catch (error) {
        console.error('[Web3 Service Error] Failed to issue Eco Tokens:', error);
        
        // Record failed transaction if we have a userId
        if (user && user.id) {
            await TokenTx.create({
                userId: user.id,
                amount: amount,
                submissionId: submissionId || null,
                txHash: 'Error',
                status: 'Failed'
            });
        }
        throw error;
    }
};

/**
 * Mints an NFT Tree for a specific action.
 */
const mintNFTTree = async (user, submission) => {
    try {
        console.log(`[Web3 Service] Processing NFT Tree for ${user.walletAddress}...`);

        let txHash, tokenId;

        if (isWeb3Ready && user.walletAddress) {
            // --- REAL BLOCKCHAIN CALL ---
            const metadataUri = `https://greenverse.io/metadata/tree/${submission.id}`;
            const tx = await nftContract.mintTree(user.walletAddress, metadataUri);
            const receipt = await tx.wait();
            
            txHash = receipt.hash;
            
            // Extract tokenId from Transfer event (standard for ERC721)
            const log = receipt.logs.find(x => x.fragment && x.fragment.name === 'Transfer');
            tokenId = log ? log.args[2].toString() : `NFT-${receipt.blockNumber}`;
        } else {
            // --- MOCK FALLBACK ---
            await new Promise(resolve => setTimeout(resolve, 1500));
            txHash = `0x-mock-nft-${Math.random().toString(16).substr(2, 32)}`;
            tokenId = `GV-${Math.floor(Math.random() * 900000) + 100000}`;
            console.log(`[Web3 Service] Mock NFT Minted. Token ID: ${tokenId}`);
        }

        const categoryMap = {
            recycling: 'Resource Guardian',
            energy_saving: 'Green Kilowatt',
            plantation: 'Virtual Oak',
            cleanup: 'Ocean Hero',
            wildlife: 'Summit Eagle',
            renewable: 'Solar Phoenix',
            marine: 'Abyssal Pearl'
        };

        await NFTTree.create({
            ownerId: user.id,
            tokenId: tokenId,
            txHash: txHash,
            treeType: categoryMap[submission.category] || 'Eco-Citizen Heritage',
            region: 'Global Metaverse',
            category: submission.category || 'plantation'
        });

        return { txHash, tokenId };

    } catch (error) {
        console.error('[Web3 Service Error] Failed to mint NFT:', error);
        throw error;
    }
};

module.exports = {
    issueEcoTokens,
    mintNFTTree
};
