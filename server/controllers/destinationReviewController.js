const mongoose = require('mongoose');
const DestinationReview = require('../models/DestinationReview');
const Destination = require('../models/Destination');
const { getFallbackStatus } = require('../config/db');

// In-memory fallback review store for dev/testing when MongoDB is unavailable
const memoryDestinationReviews = [
  {
    _id: 'rev_dest_1',
    user: {
      _id: '65f8a09b1234567890abcde1',
      name: 'Rohan Mehta',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      location: 'Mumbai',
    },
    destination: 'dest_1',
    rating: 5,
    title: 'Amazing mountain experience',
    comment: 'The views were incredible and the weather in Manali was perfect. Visited Solang Valley for paragliding and explored Old Manali cafes!',
    images: ['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80'],
    helpfulCount: 23,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    _id: 'rev_dest_2',
    user: {
      _id: '65f8a09b1234567890abcde2',
      name: 'Ananya Roy',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      location: 'Kolkata',
    },
    destination: 'dest_1',
    rating: 4,
    title: 'Great destination & delicious food',
    comment: 'Loved the apple orchards and local trout fish. Solang Valley was slightly crowded, but Hadimba Temple was serene.',
    images: ['https://images.unsplash.com/photo-1593181629936-11c609b8db9b?auto=format&fit=crop&w=800&q=80'],
    helpfulCount: 12,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    _id: 'rev_dest_3',
    user: {
      _id: '65f8a09b1234567890abcde3',
      name: 'Karan Kapoor',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      location: 'Delhi',
    },
    destination: 'dest_1',
    rating: 5,
    title: 'Breathtaking Himalayan views',
    comment: 'Best mountain destination in North India. Must visit Jogini Waterfall trek for a tranquil experience.',
    images: [],
    helpfulCount: 8,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

// Helper: Compute average rating, count, and distribution
const calculateRatingSummary = async (destinationIdStr) => {
  if (getFallbackStatus()) {
    const matched = memoryDestinationReviews.filter((r) => r.destination === destinationIdStr || r.destination?._id === destinationIdStr);
    const totalReviews = matched.length;
    if (totalReviews === 0) {
      return { averageRating: 0, totalReviews: 0, distribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 } };
    }
    const sum = matched.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    const averageRating = Number((sum / totalReviews).toFixed(1));
    const distribution = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
    matched.forEach((r) => {
      const star = String(Math.round(r.rating));
      if (distribution[star] !== undefined) distribution[star]++;
    });
    return { averageRating, totalReviews, distribution };
  }

  try {
    const destObjId = mongoose.Types.ObjectId.isValid(destinationIdStr) ? new mongoose.Types.ObjectId(destinationIdStr) : destinationIdStr;

    const stats = await DestinationReview.aggregate([
      { $match: { destination: destObjId } },
      {
        $group: {
          _id: '$destination',
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          star5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          star4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          star3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          star2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          star1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        },
      },
    ]);

    if (!stats || stats.length === 0) {
      return { averageRating: 0, totalReviews: 0, distribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 } };
    }

    const data = stats[0];
    const averageRating = Number((data.avgRating || 0).toFixed(1));
    const totalReviews = data.totalReviews || 0;
    const distribution = {
      '5': data.star5 || 0,
      '4': data.star4 || 0,
      '3': data.star3 || 0,
      '2': data.star2 || 0,
      '1': data.star1 || 0,
    };

    // Update Destination Model rating & reviewCount
    await Destination.findByIdAndUpdate(destObjId, {
      rating: averageRating,
      reviewCount: totalReviews,
    });

    return { averageRating, totalReviews, distribution };
  } catch (err) {
    console.error('Error calculating rating summary:', err.message);
    return { averageRating: 0, totalReviews: 0, distribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 } };
  }
};

// POST /api/destinations/:destinationId/reviews
const createDestinationReview = async (req, res) => {
  const { destinationId } = req.params;
  const { rating, title, comment, images } = req.body;
  const userId = req.user._id || req.user.id;

  const numRating = Number(rating);
  if (!numRating || numRating < 1 || numRating > 5) {
    return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
  }

  const cleanComment = (comment || '').trim();
  if (cleanComment.length < 10) {
    return res.status(400).json({ message: 'Review comment must be at least 10 characters long' });
  }
  if (cleanComment.length > 1000) {
    return res.status(400).json({ message: 'Review comment cannot exceed 1000 characters' });
  }

  const cleanTitle = (title || '').trim().substring(0, 100);
  const cleanImages = Array.isArray(images) ? images.slice(0, 5) : [];

  if (getFallbackStatus()) {
    const existing = memoryDestinationReviews.find(
      (r) => (r.destination === destinationId || r.destination?._id === destinationId) && String(r.user?._id || r.user) === String(userId)
    );
    if (existing) {
      return res.status(409).json({ message: 'You have already reviewed this destination', review: existing });
    }

    const newRev = {
      _id: 'rev_dest_' + Date.now(),
      user: {
        _id: userId,
        name: req.user.name || 'Traveler',
        avatar: req.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        location: req.user.location || 'India',
      },
      destination: destinationId,
      rating: numRating,
      title: cleanTitle || 'Traveler Experience',
      comment: cleanComment,
      images: cleanImages,
      helpfulCount: 0,
      createdAt: new Date().toISOString(),
    };
    memoryDestinationReviews.unshift(newRev);

    const summary = await calculateRatingSummary(destinationId);
    return res.status(201).json({ message: 'Review submitted successfully', review: newRev, summary });
  }

  try {
    const existingReview = await DestinationReview.findOne({ user: userId, destination: destinationId });
    if (existingReview) {
      return res.status(409).json({ message: 'You have already reviewed this destination', review: existingReview });
    }

    const review = await DestinationReview.create({
      user: userId,
      destination: destinationId,
      rating: numRating,
      title: cleanTitle || 'Traveler Experience',
      comment: cleanComment,
      images: cleanImages,
    });

    const populated = await DestinationReview.findById(review._id).populate('user', 'name avatar location');
    const summary = await calculateRatingSummary(destinationId);

    res.status(201).json({ message: 'Review submitted successfully', review: populated, summary });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You have already reviewed this destination' });
    }
    res.status(500).json({ message: error.message });
  }
};

// GET /api/destinations/:destinationId/reviews
const getDestinationReviews = async (req, res) => {
  const { destinationId } = req.params;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 10));
  const sortParam = req.query.sort || 'newest';

  if (getFallbackStatus()) {
    let matched = memoryDestinationReviews.filter((r) => r.destination === destinationId || r.destination?._id === destinationId);

    if (sortParam === 'highest') matched.sort((a, b) => b.rating - a.rating);
    else if (sortParam === 'lowest') matched.sort((a, b) => a.rating - b.rating);
    else if (sortParam === 'helpful') matched.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
    else matched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalReviews = matched.length;
    const startIndex = (page - 1) * limit;
    const paginated = matched.slice(startIndex, startIndex + limit);

    const currentUserId = req.user ? String(req.user._id || req.user.id) : null;
    const userReview = currentUserId ? matched.find((r) => String(r.user?._id || r.user) === currentUserId) || null : null;

    return res.json({
      reviews: paginated,
      page,
      limit,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit) || 1,
      userReview,
    });
  }

  try {
    let sortObj = { createdAt: -1 };
    if (sortParam === 'highest') sortObj = { rating: -1, createdAt: -1 };
    else if (sortParam === 'lowest') sortObj = { rating: 1, createdAt: -1 };
    else if (sortParam === 'helpful') sortObj = { helpfulCount: -1, createdAt: -1 };

    const totalReviews = await DestinationReview.countDocuments({ destination: destinationId });
    const reviews = await DestinationReview.find({ destination: destinationId })
      .populate('user', 'name avatar location')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit);

    const currentUserId = req.user ? req.user._id : null;
    let userReview = null;
    if (currentUserId) {
      userReview = await DestinationReview.findOne({ destination: destinationId, user: currentUserId }).populate(
        'user',
        'name avatar location'
      );
    }

    res.json({
      reviews,
      page,
      limit,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit) || 1,
      userReview,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/destinations/:destinationId/rating
const getDestinationRatingSummary = async (req, res) => {
  const { destinationId } = req.params;
  const summary = await calculateRatingSummary(destinationId);
  res.json(summary);
};

// PUT /api/destinations/:destinationId/reviews/:reviewId
const updateDestinationReview = async (req, res) => {
  const { destinationId, reviewId } = req.params;
  const { rating, title, comment, images } = req.body;
  const userId = req.user._id || req.user.id;

  const numRating = Number(rating);
  if (!numRating || numRating < 1 || numRating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  const cleanComment = (comment || '').trim();
  if (cleanComment.length < 10 || cleanComment.length > 1000) {
    return res.status(400).json({ message: 'Review comment must be between 10 and 1000 characters' });
  }

  if (getFallbackStatus()) {
    const rev = memoryDestinationReviews.find((r) => r._id === reviewId);
    if (!rev) return res.status(404).json({ message: 'Review not found' });
    if (String(rev.user?._id || rev.user) !== String(userId)) {
      return res.status(403).json({ message: 'Not authorized to edit this review' });
    }
    rev.rating = numRating;
    rev.title = (title || rev.title).substring(0, 100);
    rev.comment = cleanComment;
    if (Array.isArray(images)) rev.images = images.slice(0, 5);
    rev.updatedAt = new Date().toISOString();

    const summary = await calculateRatingSummary(destinationId);
    return res.json({ message: 'Review updated successfully', review: rev, summary });
  }

  try {
    const review = await DestinationReview.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this review' });
    }

    review.rating = numRating;
    review.title = (title || review.title).substring(0, 100);
    review.comment = cleanComment;
    if (Array.isArray(images)) review.images = images.slice(0, 5);
    await review.save();

    const populated = await DestinationReview.findById(review._id).populate('user', 'name avatar location');
    const summary = await calculateRatingSummary(destinationId);

    res.json({ message: 'Review updated successfully', review: populated, summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/destinations/:destinationId/reviews/:reviewId
const deleteDestinationReview = async (req, res) => {
  const { destinationId, reviewId } = req.params;
  const userId = req.user._id || req.user.id;

  if (getFallbackStatus()) {
    const idx = memoryDestinationReviews.findIndex((r) => r._id === reviewId);
    if (idx === -1) return res.status(404).json({ message: 'Review not found' });
    if (String(memoryDestinationReviews[idx].user?._id || memoryDestinationReviews[idx].user) !== String(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    memoryDestinationReviews.splice(idx, 1);
    const summary = await calculateRatingSummary(destinationId);
    return res.json({ message: 'Review deleted successfully', summary });
  }

  try {
    const review = await DestinationReview.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await DestinationReview.findByIdAndDelete(reviewId);
    const summary = await calculateRatingSummary(destinationId);

    res.json({ message: 'Review deleted successfully', summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDestinationReview,
  getDestinationReviews,
  getDestinationRatingSummary,
  updateDestinationReview,
  deleteDestinationReview,
  calculateRatingSummary,
  memoryDestinationReviews,
};
