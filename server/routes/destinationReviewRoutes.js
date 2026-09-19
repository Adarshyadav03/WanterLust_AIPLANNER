const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createDestinationReview,
  getDestinationReviews,
  getDestinationRatingSummary,
  updateDestinationReview,
  deleteDestinationReview,
} = require('../controllers/destinationReviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:destinationId/reviews')
  .get(getDestinationReviews)
  .post(protect, createDestinationReview);

router.get('/:destinationId/rating', getDestinationRatingSummary);

router.route('/:destinationId/reviews/:reviewId')
  .put(protect, updateDestinationReview)
  .delete(protect, deleteDestinationReview);

module.exports = router;
