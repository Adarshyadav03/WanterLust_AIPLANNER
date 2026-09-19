const User = require('../models/User');
const Trip = require('../models/Trip');
const Group = require('../models/Group');
const Post = require('../models/Post');
const { getFallbackStatus } = require('../config/db');

const getDashboardStats = async (req, res) => {
  if (getFallbackStatus()) {
    return res.json({
      totalUsers: 1245,
      totalTrips: 326,
      activeGroups: 89,
      totalPosts: 542,
      popularDestinations: [
        { name: 'Manali', count: 142 },
        { name: 'Goa', count: 118 },
        { name: 'Kerala', count: 95 },
        { name: 'Leh-Ladakh', count: 74 },
        { name: 'Rajasthan', count: 62 },
      ],
      tripsPerMonth: [
        { month: 'Jan', trips: 35 },
        { month: 'Feb', trips: 42 },
        { month: 'Mar', trips: 58 },
        { month: 'Apr', trips: 48 },
        { month: 'May', trips: 65 },
        { month: 'Jun', trips: 78 },
      ],
      userGrowth: [
        { month: 'Jan', users: 800 },
        { month: 'Feb', users: 920 },
        { month: 'Mar', users: 1050 },
        { month: 'Apr', users: 1120 },
        { month: 'May', users: 1245 },
      ],
    });
  }

  try {
    const userCount = await User.countDocuments();
    const tripCount = await Trip.countDocuments();
    const groupCount = await Group.countDocuments();
    const postCount = await Post.countDocuments();

    res.json({
      totalUsers: userCount || 1245,
      totalTrips: tripCount || 326,
      activeGroups: groupCount || 89,
      totalPosts: postCount || 542,
      popularDestinations: [
        { name: 'Manali', count: 142 },
        { name: 'Goa', count: 118 },
        { name: 'Kerala', count: 95 },
        { name: 'Leh-Ladakh', count: 74 },
        { name: 'Rajasthan', count: 62 },
      ],
      tripsPerMonth: [
        { month: 'Jan', trips: 35 },
        { month: 'Feb', trips: 42 },
        { month: 'Mar', trips: 58 },
        { month: 'Apr', trips: 48 },
        { month: 'May', trips: 65 },
        { month: 'Jun', trips: 78 },
      ],
      userGrowth: [
        { month: 'Jan', users: 800 },
        { month: 'Feb', users: 920 },
        { month: 'Mar', users: 1050 },
        { month: 'Apr', users: 1120 },
        { month: 'May', users: 1245 },
      ],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  if (getFallbackStatus()) {
    return res.json([
      { _id: 'u1', name: 'Rahul Sharma', email: 'rahul@wanderlust.com', role: 'user', location: 'Mumbai', createdAt: '2026-01-15' },
      { _id: 'u2', name: 'Sneha Patel', email: 'sneha@wanderlust.com', role: 'user', location: 'Ahmedabad', createdAt: '2026-02-10' },
      { _id: 'u3', name: 'Amit Verma', email: 'amit@wanderlust.com', role: 'user', location: 'Delhi', createdAt: '2026-03-01' },
      { _id: 'admin1', name: 'Admin User', email: 'admin@wanderlust.com', role: 'admin', location: 'Bengaluru', createdAt: '2026-01-01' },
    ]);
  }

  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReports = async (req, res) => {
  res.json([
    { id: 'rep_1', type: 'Spam Post', reportedItem: 'Commercial promotion link', status: 'Pending', createdAt: '2026-09-18' },
    { id: 'rep_2', type: 'Inappropriate Content', reportedItem: 'Abusive comment on Goa travel thread', status: 'Resolved', createdAt: '2026-09-15' },
  ]);
};

module.exports = {
  getDashboardStats,
  getUsers,
  getReports,
};
