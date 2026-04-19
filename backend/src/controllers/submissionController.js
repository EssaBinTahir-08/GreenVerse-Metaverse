const { Submission, User } = require('../models');
const { issueEcoTokens, mintNFTTree } = require('../services/blockchain.service');

/**
 * @desc Create a new eco-action submission
 * @route POST /api/submissions
 * @access Private
 */
const createSubmission = async (req, res) => {
    try {
        const { category, notes } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: 'Evidence file is required' });
        }

        const submission = await Submission.create({
            userId: req.user.id,
            category,
            evidenceUrl: `/uploads/${req.file.filename}`,
            notes,
            status: 'Pending'
        });

        res.status(201).json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Get user's own submissions
 * @route GET /api/submissions/my
 * @access Private
 */
const getMySubmissions = async (req, res) => {
    try {
        const submissions = await Submission.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Get all pending submissions (Admin only)
 * @route GET /api/submissions/pending
 * @access Private/Admin
 */
const getPendingSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.findAll({
            where: { status: 'Pending' },
            include: [{ model: User, as: 'user', attributes: ['displayName', 'walletAddress'] }],
            order: [['createdAt', 'ASC']]
        });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Review a submission (Approve/Reject)
 * @route PUT /api/submissions/:id/review
 * @access Private/Admin
 */
const reviewSubmission = async (req, res) => {
    try {
        const { status, decisionReason } = req.body;
        const submission = await Submission.findByPk(req.params.id, {
            include: [{ model: User, as: 'user' }]
        });

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        submission.status = status;
        submission.decisionReason = decisionReason;
        submission.reviewerId = req.user.id;
        await submission.save();

        if (status === 'Approved') {
            const user = submission.user;
            
            // Define reward mapping
            const rewards = {
                recycling: { tokens: 30, mintNft: true },
                energy_saving: { tokens: 50, mintNft: true },
                plantation: { tokens: 100, mintNft: true },
                cleanup: { tokens: 150, mintNft: true },
                wildlife: { tokens: 200, mintNft: true },
                renewable: { tokens: 250, mintNft: true },
                marine: { tokens: 300, mintNft: true }
            };

            const config = rewards[submission.category] || { tokens: 10, mintNft: false };
            
            // 1. Issue Tokens based on category impact
            await issueEcoTokens(user, config.tokens, submission.id);

            // 2. Mint NFT for all significant activities
            if (config.mintNft) {
                await mintNFTTree(user, submission);
            }
        }

        res.json({ message: `Submission ${status.toLowerCase()} successfully`, submission });
    } catch (error) {
        console.error('Review Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createSubmission,
    getMySubmissions,
    getPendingSubmissions,
    reviewSubmission
};
