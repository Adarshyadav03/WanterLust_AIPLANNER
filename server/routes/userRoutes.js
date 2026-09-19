const express = require('express');
const router = express.Router();
const { updateProfile, getTravelBuddies, searchUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/search', protect, searchUsers);
router.put('/profile', protect, updateProfile);
router.get('/buddies', protect, getTravelBuddies);

module.exports = router;
