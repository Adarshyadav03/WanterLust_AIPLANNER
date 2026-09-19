const GroupMessage = require('../models/GroupMessage');
const Group = require('../models/Group');
const { getFallbackStatus } = require('../config/db');

const memoryGroupMessages = {};

const getGroupMessages = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user._id;

  if (getFallbackStatus()) {
    return res.json(memoryGroupMessages[groupId] || []);
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Authorization check: user must be member or owner
    const isMember = group.members.some((m) => m.toString() === userId.toString());
    if (!isMember && group.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied. You must be a group member.' });
    }

    const messages = await GroupMessage.find({ group: groupId })
      .populate('sender', 'name avatar email')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.json(memoryGroupMessages[groupId] || []);
  }
};

const sendGroupMessage = async (req, res) => {
  const { groupId } = req.params;
  const { message, attachments, replyTo } = req.body;
  const userId = req.user._id;

  if (getFallbackStatus()) {
    const newMsg = {
      _id: 'gmsg_' + Date.now(),
      group: groupId,
      sender: { _id: userId, name: req.user.name, avatar: req.user.avatar },
      message: message || '',
      attachments: attachments || [],
      replyTo: replyTo || null,
      reactions: [],
      createdAt: new Date().toISOString(),
    };
    if (!memoryGroupMessages[groupId]) memoryGroupMessages[groupId] = [];
    memoryGroupMessages[groupId].push(newMsg);
    return res.status(201).json(newMsg);
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Verify membership
    const isMember = group.members.some((m) => m.toString() === userId.toString());
    if (!isMember && group.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Only group members can send messages' });
    }

    const newGroupMsg = await GroupMessage.create({
      group: groupId,
      sender: userId,
      message: message || '',
      attachments: attachments || [],
      replyTo: replyTo || null,
    });

    const populated = await GroupMessage.findById(newGroupMsg._id).populate('sender', 'name avatar email');

    // Socket broadcast
    if (req.io) {
      req.io.to(`group:${groupId}`).emit('receive_group_message', populated);
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGroupMessages,
  sendGroupMessage,
};
