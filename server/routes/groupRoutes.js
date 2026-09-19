const express = require('express');
const router = express.Router();
const {
  getGroups,
  getGroupById,
  createGroup,
  inviteBuddyToGroup,
  respondGroupInvite,
  joinGroupByCode,
  getGroupByInviteCode,
  generateInviteCode,
  toggleInviteLink,
  getInvitableBuddies,
  getMyGroupInvitations,
  getGroupMembers,
} = require('../controllers/groupController');
const { getGroupMessages, sendGroupMessage } = require('../controllers/groupMessageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getGroups);
router.post('/', protect, createGroup);

// Public / Invite link routes
router.get('/join/:inviteCode', getGroupByInviteCode);
router.post('/join/:inviteCode', protect, joinGroupByCode);
router.post('/join', protect, joinGroupByCode);

router.get('/invitations', protect, getMyGroupInvitations);
router.get('/:id', protect, getGroupById);
router.get('/:groupId/members', protect, getGroupMembers);
router.get('/:groupId/invitable-buddies', protect, getInvitableBuddies);

// Invite code generation & toggle endpoints
router.post('/:groupId/invite-code', protect, generateInviteCode);
router.put('/:groupId/invite-toggle', protect, toggleInviteLink);

// Group Buddy / Direct User Invites endpoints
router.post('/:groupId/invite/:userId', protect, inviteBuddyToGroup);
router.post('/:groupId/invite', protect, inviteBuddyToGroup);

// Supports both POST and PUT for accept/reject
const handleAccept = (req, res, next) => {
  req.body.action = 'accept';
  next();
};

const handleReject = (req, res, next) => {
  req.body.action = 'decline';
  next();
};

router.post('/:groupId/invite/accept', protect, handleAccept, respondGroupInvite);
router.put('/:groupId/invite/accept', protect, handleAccept, respondGroupInvite);

router.post('/:groupId/invite/reject', protect, handleReject, respondGroupInvite);
router.put('/:groupId/invite/reject', protect, handleReject, respondGroupInvite);

router.put('/:groupId/invite/respond', protect, respondGroupInvite);

// Group Chat endpoints
router.get('/:groupId/messages', protect, getGroupMessages);
router.post('/:groupId/messages', protect, sendGroupMessage);

module.exports = router;
