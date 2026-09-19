const Review = require('../models/Review');
const { getFallbackStatus } = require('../config/db');

const memoryReviews = [
  {
    _id: 'rev_1',
    user: {
      _id: 'u1',
      name: 'Priya Nair',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },
    rating: 5,
    comment: 'The AI itinerary generated for our Manali trip was spot on! It accounted for our vegetarian food preferences and saved us over ₹5,000 in budget.',
    role: 'Solo Traveler & Photographer',
    createdAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    _id: 'rev_2',
    user: {
      _id: 'u2',
      name: 'Rahul Sharma',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    },
    rating: 5,
    comment: 'The real-time group chat and invitation code features made coordinating our Goa reunion super smooth. Highly recommended MCA project execution!',
    role: 'Full Stack Developer',
    createdAt: new Date(Date.now() - 86400000 * 5),
  },
  {
    _id: 'rev_3',
    user: {
      _id: 'u3',
      name: 'Sneha Patel',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    },
    rating: 5,
    comment: 'The budget management Donut chart was so helpful. We received threshold warnings when approaching our budget limits during our Kerala backwater tour.',
    role: 'Travel Enthusiast',
    createdAt: new Date(Date.now() - 86400000 * 7),
  },
];

const getPlatformReviews = async (req, res) => {
  if (getFallbackStatus()) {
    return res.json(memoryReviews);
  }

  try {
    const reviews = await Review.find({ type: 'platform' })
      .populate('user', 'name avatar location')
      .sort({ createdAt: -1 });

    if (reviews.length === 0) return res.json(memoryReviews);
    res.json(reviews);
  } catch (error) {
    res.json(memoryReviews);
  }
};

const createPlatformReview = async (req, res) => {
  const { rating, comment, role } = req.body;
  const userId = req.user ? req.user._id : '65f8a09b1234567890abcde0';

  if (!rating || !comment) {
    return res.status(400).json({ message: 'Rating and review comment are required' });
  }

  const reviewObj = {
    _id: 'rev_' + Date.now(),
    user: req.user
      ? { _id: req.user._id, name: req.user.name, avatar: req.user.avatar }
      : { _id: '65f8a09b1234567890abcde0', name: 'Demo Traveler', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
    rating: Number(rating),
    comment: comment.trim(),
    role: role || 'Traveler',
    createdAt: new Date(),
  };

  if (getFallbackStatus()) {
    memoryReviews.unshift(reviewObj);
    return res.status(201).json(reviewObj);
  }

  try {
    const newRev = await Review.create({
      user: userId,
      rating: Number(rating),
      comment: comment.trim(),
      role: role || 'Traveler',
      type: 'platform',
    });

    const populated = await Review.findById(newRev._id).populate('user', 'name avatar location');
    res.status(201).json(populated);
  } catch (error) {
    memoryReviews.unshift(reviewObj);
    res.status(201).json(reviewObj);
  }
};

const deleteReview = async (req, res) => {
  const { id } = req.params;

  if (getFallbackStatus()) {
    const idx = memoryReviews.findIndex((r) => r._id === id);
    if (idx !== -1) memoryReviews.splice(idx, 1);
    return res.json({ message: 'Review removed' });
  }

  try {
    await Review.findByIdAndDelete(id);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPlatformReviews,
  createPlatformReview,
  deleteReview,
  memoryReviews,
};
