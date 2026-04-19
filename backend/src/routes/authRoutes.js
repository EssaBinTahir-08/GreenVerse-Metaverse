const express = require('express');
const router = express.Router();
const { registerUser, loginUser, linkWallet } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

// User profile specific routes
router.post('/link-wallet', protect, linkWallet);

module.exports = router;
