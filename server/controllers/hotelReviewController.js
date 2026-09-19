const mongoose = require('mongoose');
const HotelReview = require('../models/HotelReview');
const { getFallbackStatus } = require('../config/db');

// In-memory fallback review store for dev/testing when MongoDB is unavailable
const memoryHotelReviews = [
  {
    _id: 'rev_hotel_1',
    user: {
      _id: '65f8a09b1234567890abcde1',
      name: 'Rohan Mehta',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      location: 'Mumbai',
    },
    hotel: 'The Himalayan Resort',
    hotelName: 'The Himalayan Resort',
    rating: 5,
    title: 'Excellent stay with mountain view',
    comment: 'Very clean rooms and beautiful mountain view. Staff was extremely helpful and the breakfast spread was fantastic.',
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'],
    helpfulCount: 18,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    _id: 'rev_hotel_2',
    user: {
      _id: '65f8a09b1234567890abcde4',
      name: 'Pooja Hegde',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      location: 'Bengaluru',
    },
    hotel: 'The Himalayan Resort',
    hotelName: 'The Himalayan Resort',
    rating: 4,
    title: 'Good hotel & pleasant stay',
    comment: 'Cozy fireplace lounge and polite room service. Location is ideal for walks to the local market.',
    images: [],
    helpfulCount: 9,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];

// Helper: Compute average rating, count, and distribution
const calculateHotelRatingSummary = async (hotelIdentifier) => {
  const cleanHotelId = String(hotelIdentifier || '').trim();

  if (getFallbackStatus()) {
    const matched = memoryHotelReviews.filter((r) => r.hotel === cleanHotelId || r.hotelName === cleanHotelId);
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
    const stats = await HotelReview.aggregate([
      { $match: { hotel: cleanHotelId } },
      {
        $group: {
          _id: '$hotel',
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

    return { averageRating, totalReviews, distribution };
  } catch (err) {
    console.error('Error calculating hotel rating summary:', err.message);
    return { averageRating: 0, totalReviews: 0, distribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 } };
  }
};

// POST /api/hotels/:hotelId/reviews
const createHotelReview = async (req, res) => {
  const { hotelId } = req.params;
  const { rating, title, comment, images, hotelName, destination } = req.body;
  const userId = req.user._id || req.user.id;
  const cleanHotelId = String(hotelId || '').trim();

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
    const existing = memoryHotelReviews.find((r) => r.hotel === cleanHotelId && String(r.user?._id || r.user) === String(userId));
    if (existing) {
      return res.status(409).json({ message: 'You have already reviewed this hotel', review: existing });
    }

    const newRev = {
      _id: 'rev_hotel_' + Date.now(),
      user: {
        _id: userId,
        name: req.user.name || 'Traveler',
        avatar: req.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        location: req.user.location || 'India',
      },
      hotel: cleanHotelId,
      hotelName: hotelName || cleanHotelId,
      rating: numRating,
      title: cleanTitle || 'Guest Review',
      comment: cleanComment,
      images: cleanImages,
      helpfulCount: 0,
      createdAt: new Date().toISOString(),
    };
    memoryHotelReviews.unshift(newRev);

    const summary = await calculateHotelRatingSummary(cleanHotelId);
    return res.status(201).json({ message: 'Review submitted successfully', review: newRev, summary });
  }

  try {
    const existingReview = await HotelReview.findOne({ user: userId, hotel: cleanHotelId });
    if (existingReview) {
      return res.status(409).json({ message: 'You have already reviewed this hotel', review: existingReview });
    }

    const review = await HotelReview.create({
      user: userId,
      hotel: cleanHotelId,
      hotelName: hotelName || cleanHotelId,
      destination: destination || null,
      rating: numRating,
      title: cleanTitle || 'Guest Review',
      comment: cleanComment,
      images: cleanImages,
    });

    const populated = await HotelReview.findById(review._id).populate('user', 'name avatar location');
    const summary = await calculateHotelRatingSummary(cleanHotelId);

    res.status(201).json({ message: 'Review submitted successfully', review: populated, summary });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You have already reviewed this hotel' });
    }
    res.status(500).json({ message: error.message });
  }
};

// GET /api/hotels/:hotelId/reviews
const getHotelReviews = async (req, res) => {
  const { hotelId } = req.params;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 10));
  const sortParam = req.query.sort || 'newest';
  const cleanHotelId = String(hotelId || '').trim();

  if (getFallbackStatus()) {
    let matched = memoryHotelReviews.filter((r) => r.hotel === cleanHotelId || r.hotelName === cleanHotelId);

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

    const totalReviews = await HotelReview.countDocuments({ hotel: cleanHotelId });
    const reviews = await HotelReview.find({ hotel: cleanHotelId })
      .populate('user', 'name avatar location')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit);

    const currentUserId = req.user ? req.user._id : null;
    let userReview = null;
    if (currentUserId) {
      userReview = await HotelReview.findOne({ hotel: cleanHotelId, user: currentUserId }).populate('user', 'name avatar location');
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

// GET /api/hotels/:hotelId/rating
const getHotelRatingSummary = async (req, res) => {
  const { hotelId } = req.params;
  const summary = await calculateHotelRatingSummary(hotelId);
  res.json(summary);
};

// PUT /api/hotels/:hotelId/reviews/:reviewId
const updateHotelReview = async (req, res) => {
  const { hotelId, reviewId } = req.params;
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
    const rev = memoryHotelReviews.find((r) => r._id === reviewId);
    if (!rev) return res.status(404).json({ message: 'Review not found' });
    if (String(rev.user?._id || rev.user) !== String(userId)) {
      return res.status(403).json({ message: 'Not authorized to edit this review' });
    }
    rev.rating = numRating;
    rev.title = (title || rev.title).substring(0, 100);
    rev.comment = cleanComment;
    if (Array.isArray(images)) rev.images = images.slice(0, 5);
    rev.updatedAt = new Date().toISOString();

    const summary = await calculateHotelRatingSummary(hotelId);
    return res.json({ message: 'Review updated successfully', review: rev, summary });
  }

  try {
    const review = await HotelReview.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this review' });
    }

    review.rating = numRating;
    review.title = (title || review.title).substring(0, 100);
    review.comment = cleanComment;
    if (Array.isArray(images)) review.images = images.slice(0, 5);
    await review.save();

    const populated = await HotelReview.findById(review._id).populate('user', 'name avatar location');
    const summary = await calculateHotelRatingSummary(hotelId);

    res.json({ message: 'Review updated successfully', review: populated, summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/hotels/:hotelId/reviews/:reviewId
const deleteHotelReview = async (req, res) => {
  const { hotelId, reviewId } = req.params;
  const userId = req.user._id || req.user.id;

  if (getFallbackStatus()) {
    const idx = memoryHotelReviews.findIndex((r) => r._id === reviewId);
    if (idx === -1) return res.status(404).json({ message: 'Review not found' });
    if (String(memoryHotelReviews[idx].user?._id || memoryHotelReviews[idx].user) !== String(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    memoryHotelReviews.splice(idx, 1);
    const summary = await calculateHotelRatingSummary(hotelId);
    return res.json({ message: 'Review deleted successfully', summary });
  }

  try {
    const review = await HotelReview.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await HotelReview.findByIdAndDelete(reviewId);
    const summary = await calculateHotelRatingSummary(hotelId);

    res.json({ message: 'Review deleted successfully', summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createHotelReview,
  getHotelReviews,
  getHotelRatingSummary,
  updateHotelReview,
  deleteHotelReview,
  calculateHotelRatingSummary,
  memoryHotelReviews,
};
