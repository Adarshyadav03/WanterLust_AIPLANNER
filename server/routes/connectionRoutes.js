const express = require('express');
const router = express.Router();
const {
  sendConnectionRequest,
  getConnectionStatus,
  acceptConnection,
  rejectConnection,
  getMyRequests,
  getMyFriends,
  removeConnection,
} = require('../controllers/connectionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/request/:userId', protect, sendConnectionRequest);
router.get('/status/:userId', protect, getConnectionStatus);
router.put('/:connectionId/accept', protect, acceptConnection);
router.put('/:connectionId/reject', protect, rejectConnection);
router.get('/requests', protect, getMyRequests);
router.get('/friends', protect, getMyFriends);
router.delete('/:userId', protect, removeConnection);

module.exports = router;
