const { User, NFTTree, TokenTx } = require('../models');

const getMyTrees = async (req, res) => {
    try {
        const trees = await NFTTree.findAll({
            where: { ownerId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(trees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const mintNewTree = async (req, res) => {
    try {
        const { treeType, region, txHash, category } = req.body;

        if (!treeType || !region || !txHash) {
            return res.status(400).json({ message: 'Missing required minting fields' });
        }

        const newTree = await NFTTree.create({
            ownerId: req.user.id,
            tokenId: `GV-${Math.floor(Math.random() * 900000) + 100000}`,
            txHash: txHash,
            treeType: treeType,
            region: region,
            category: category || 'plantation'
        });

        // Increase EcoScore by 100 points per NFT minted
        const user = await User.findByPk(req.user.id);
        if (user) {
            user.ecoScore = (user.ecoScore || 0) + 100;
            await user.save();
        }

        res.status(201).json(newTree);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getLeaderboard = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'displayName', 'ecoScore'],
            include: [{
                model: NFTTree,
                as: 'nftTrees',
                attributes: ['id']
            }],
            order: [['ecoScore', 'DESC']],
            limit: 50
        });

        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            id: user.id,
            name: user.displayName,
            score: user.ecoScore,
            trees: user.nftTrees ? user.nftTrees.length : 0
        }));

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyTransactions = async (req, res) => {
    try {
        const txs = await TokenTx.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(txs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMyTrees,
    mintNewTree,
    getLeaderboard,
    getMyTransactions
};
