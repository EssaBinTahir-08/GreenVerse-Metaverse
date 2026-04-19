const express = require('express');
const router = express.Router();
const { 
    createSubmission, 
    getMySubmissions, 
    getPendingSubmissions, 
    reviewSubmission 
} = require('../controllers/submissionController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// User routes
router.post('/', protect, upload.single('evidence'), createSubmission);
router.get('/my', protect, getMySubmissions);

// Admin routes
router.get('/pending', protect, admin, getPendingSubmissions);
router.put('/:id/review', protect, admin, reviewSubmission);

module.exports = router;
