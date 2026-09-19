const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  googleAuth,
  googleCallback,
  githubAuth,
  githubCallback,
  getMe,
  logoutUser,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);

// OAuth 2.0 Routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

router.get('/github', githubAuth);
router.get('/github/callback', githubCallback);

module.exports = router;
