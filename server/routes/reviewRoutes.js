const express = require('express');
const router = express.Router();
const { getPlatformReviews, createPlatformReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getPlatformReviews);
router.post('/', protect, createPlatformReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
