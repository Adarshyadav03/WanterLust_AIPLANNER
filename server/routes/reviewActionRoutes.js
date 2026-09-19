const express = require('express');
const router = express.Router();
const { toggleHelpful, reportReview, getReportedReviews } = require('../controllers/reviewActionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/:reviewId/helpful', protect, toggleHelpful);
router.post('/:reviewId/report', protect, reportReview);
router.get('/admin/reports', protect, adminOnly, getReportedReviews);

module.exports = router;
