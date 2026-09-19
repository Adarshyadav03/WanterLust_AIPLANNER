const DestinationReview = require('../models/DestinationReview');
const HotelReview = require('../models/HotelReview');
const ReviewHelpful = require('../models/ReviewHelpful');
const ReviewReport = require('../models/ReviewReport');
const { getFallbackStatus } = require('../config/db');

// POST /api/reviews/:reviewId/helpful
const toggleHelpful = async (req, res) => {
  const { reviewId } = req.params;
  const { reviewType } = req.body; // 'destination' | 'hotel'
  const userId = req.user._id || req.user.id;

  if (getFallbackStatus()) {
    return res.json({ helpfulCount: Math.floor(Math.random() * 20) + 1, isHelpful: true });
  }

  try {
    const isHotel = reviewType === 'hotel';
    const Model = isHotel ? HotelReview : DestinationReview;

    const existingVote = await ReviewHelpful.findOne({ user: userId, review: reviewId });

    if (existingVote) {
      // Remove vote
      await ReviewHelpful.findByIdAndDelete(existingVote._id);
      const updatedReview = await Model.findByIdAndUpdate(reviewId, { $inc: { helpfulCount: -1 } }, { new: true });
      return res.json({
        message: 'Helpful vote removed',
        helpfulCount: Math.max(0, updatedReview?.helpfulCount || 0),
        isHelpful: false,
      });
    } else {
      // Add vote
      await ReviewHelpful.create({ user: userId, review: reviewId, reviewType: isHotel ? 'hotel' : 'destination' });
      const updatedReview = await Model.findByIdAndUpdate(reviewId, { $inc: { helpfulCount: 1 } }, { new: true });
      return res.json({
        message: 'Marked review as helpful',
        helpfulCount: updatedReview?.helpfulCount || 1,
        isHelpful: true,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/reviews/:reviewId/report
const reportReview = async (req, res) => {
  const { reviewId } = req.params;
  const { reviewType, reason } = req.body;
  const userId = req.user._id || req.user.id;

  if (getFallbackStatus()) {
    return res.json({ message: 'Review reported successfully' });
  }

  try {
    await ReviewReport.create({
      review: reviewId,
      reviewType: reviewType === 'hotel' ? 'hotel' : 'destination',
      reportedBy: userId,
      reason: reason || 'Spam',
    });

    res.json({ message: 'Review reported to moderation team successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reviews/admin/reports
const getReportedReviews = async (req, res) => {
  if (getFallbackStatus()) {
    return res.json({
      reports: [
        {
          _id: 'rep_1',
          reason: 'Spam',
          status: 'pending',
          reportedBy: { name: 'Ananya Roy', email: 'ananya@example.com' },
          createdAt: new Date().toISOString(),
        },
      ],
    });
  }

  try {
    const reports = await ReviewReport.find({ status: 'pending' })
      .populate('reportedBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ reports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  toggleHelpful,
  reportReview,
  getReportedReviews,
};
