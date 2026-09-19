const express = require('express');
const router = express.Router();
const {
  getConversations,
  getPrivateChatHistory,
  sendPrivateMessage,
  getGroupMessages,
  sendMessage,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/conversations', protect, getConversations);
router.get('/private/:userId', protect, getPrivateChatHistory);
router.post('/private/:userId', protect, sendPrivateMessage);

// Group chat fallback
router.get('/group/:id', protect, getGroupMessages);
router.post('/group/:id', protect, sendMessage);

module.exports = router;
