const express = require('express');
const router = express.Router();
const { getMyTrees, mintNewTree, getLeaderboard, getMyTransactions } = require('../controllers/nftController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/leaderboard', getLeaderboard);

// User protected routes
router.get('/my-trees', protect, getMyTrees);
router.get('/my-transactions', protect, getMyTransactions);
router.post('/mint', protect, mintNewTree);

module.exports = router;
