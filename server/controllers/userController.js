const User = require('../models/User');
const { getFallbackStatus } = require('../config/db');

const demoTravelers = [
  {
    _id: '65f8a09b1234567890abcde1',
    name: 'Rohan Mehta',
    age: 24,
    city: 'Mumbai',
    location: 'Mumbai',
    email: 'rohan@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    travelStyle: 'Adventure',
    interests: ['Trekking', 'Photography', 'Camping'],
    destination: 'Manali',
    targetDestination: 'Manali',
    budget: '₹20,000',
    bio: 'Avid mountain trekker looking for travel buddies to explore Himachal Pradesh.',
  },
  {
    _id: '65f8a09b1234567890abcde2',
    name: 'Ananya Roy',
    age: 23,
    city: 'Kolkata',
    location: 'Kolkata',
    email: 'ananya@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    travelStyle: 'Relaxed',
    interests: ['Beaches', 'Seafood', 'Sunset Photography'],
    destination: 'Goa',
    targetDestination: 'Goa',
    budget: '₹18,000',
    bio: 'Beach lover planning a weekend trip to North & South Goa shacks.',
  },
  {
    _id: '65f8a09b1234567890abcde3',
    name: 'Karan Kapoor',
    age: 26,
    city: 'Delhi',
    location: 'Delhi',
    email: 'karan@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    travelStyle: 'Heritage',
    interests: ['Forts', 'Street Food', 'History'],
    destination: 'Rajasthan',
    targetDestination: 'Rajasthan',
    budget: '₹25,000',
    bio: 'History buff exploring Jaipur forts and Udaipur royal lakes.',
  },
  {
    _id: '65f8a09b1234567890abcde4',
    name: 'Pooja Hegde',
    age: 25,
    city: 'Bengaluru',
    location: 'Bengaluru',
    email: 'pooja@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    travelStyle: 'Nature',
    interests: ['Houseboats', 'Tea Estates', 'Ayurveda'],
    destination: 'Kerala',
    targetDestination: 'Kerala',
    budget: '₹22,000',
    bio: 'Nature enthusiast seeking group members for Munnar & Alleppey trip.',
  },
  {
    _id: '65f8a09b1234567890abcde5',
    name: 'Rahul Sharma',
    age: 27,
    city: 'Pune',
    location: 'Pune',
    email: 'rahul@example.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    travelStyle: 'Adventure',
    interests: ['Skiing', 'Hiking'],
    destination: 'Manali',
    targetDestination: 'Manali',
    budget: '₹24,000',
    bio: 'Mountain traveler ready for winter adventures.',
  },
];

const updateProfile = async (req, res) => {
  const { name, bio, location, interests, travelStyle, avatar } = req.body;

  if (getFallbackStatus()) {
    return res.json({
      _id: req.user ? req.user._id : '65f8a09b1234567890abcde0',
      name: name || 'Demo Traveler',
      email: req.user ? req.user.email : 'demo@wanderlust.com',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: bio || 'Passionate traveler exploring the world with WanderLust.',
      location: location || 'Mumbai, India',
      interests: interests || ['Trekking', 'Photography'],
      travelStyle: travelStyle || 'Adventure',
    });
  }

  try {
    const user = await User.findById(req.user._id);
    if (user) {
      if (name) user.name = name;
      if (bio) user.bio = bio;
      if (location) user.location = location;
      if (interests) user.interests = interests;
      if (travelStyle) user.travelStyle = travelStyle;
      if (avatar) user.avatar = avatar;

      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTravelBuddies = async (req, res) => {
  const { destination, travelStyle } = req.query;
  const currentUserId = req.user ? req.user._id.toString() : '';

  let results = [...demoTravelers];

  if (currentUserId) {
    results = results.filter((b) => b._id.toString() !== currentUserId && b.email !== req.user.email);
  }

  if (destination && destination !== 'All') {
    results = results.filter((b) => (b.destination || b.targetDestination || '').toLowerCase().includes(destination.toLowerCase()));
  }

  if (travelStyle && travelStyle !== 'All') {
    results = results.filter((b) => b.travelStyle.toLowerCase() === travelStyle.toLowerCase());
  }

  res.json(results);
};

const searchUsers = async (req, res) => {
  const q = req.query.q || '';
  const currentUserId = req.user ? req.user._id.toString() : '';

  if (!q.trim()) {
    return res.json({ success: true, users: [] });
  }

  if (getFallbackStatus()) {
    const filtered = demoTravelers.filter((u) => {
      if (u._id.toString() === currentUserId || u.email === req.user?.email) return false;
      const term = q.toLowerCase();
      return (
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.location && u.location.toLowerCase().includes(term)) ||
        (u.targetDestination && u.targetDestination.toLowerCase().includes(term))
      );
    });
    return res.json({ success: true, users: filtered });
  }

  try {
    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }],
    }).select('_id name email avatar location travelStyle targetDestination bio');

    res.json({ success: true, users });
  } catch (error) {
    const filtered = demoTravelers.filter((u) => {
      if (u._id.toString() === currentUserId) return false;
      const term = q.toLowerCase();
      return u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
    });
    res.json({ success: true, users: filtered });
  }
};

module.exports = {
  updateProfile,
  getTravelBuddies,
  searchUsers,
  demoTravelers,
};
