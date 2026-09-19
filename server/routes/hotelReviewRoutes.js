const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createHotelReview,
  getHotelReviews,
  getHotelRatingSummary,
  updateHotelReview,
  deleteHotelReview,
} = require('../controllers/hotelReviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:hotelId/reviews')
  .get(getHotelReviews)
  .post(protect, createHotelReview);

router.get('/:hotelId/rating', getHotelRatingSummary);

router.route('/:hotelId/reviews/:reviewId')
  .put(protect, updateHotelReview)
  .delete(protect, deleteHotelReview);

module.exports = router;
