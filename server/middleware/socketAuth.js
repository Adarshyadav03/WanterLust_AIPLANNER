const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketAuth = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(' ')[1] ||
      socket.handshake.query?.token;

    if (!token || token === 'null' || token === 'undefined') {
      // Guest or demo fallback token handling
      socket.user = {
        _id: '65f8a09b1234567890abcdef',
        id: '65f8a09b1234567890abcdef',
        name: 'Demo Traveler',
        email: 'demo@wanderlust.com',
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      };
      return next();
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'wanderlust_super_secret_jwt_key_2026_mca_project'
    );

    socket.user = {
      _id: decoded.id,
      id: decoded.id,
      name: decoded.name || 'Traveler',
      email: decoded.email,
      role: decoded.role || 'user',
      avatar: decoded.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    };

    next();
  } catch (err) {
    console.warn('Socket Auth Warning (Using guest fallback):', err.message);
    socket.user = {
      _id: 'guest_' + socket.id,
      id: 'guest_' + socket.id,
      name: 'Traveler',
      email: 'guest@wanderlust.com',
      role: 'user',
    };
    next();
  }
};

module.exports = socketAuth;
