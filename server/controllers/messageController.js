const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Connection = require('../models/Connection');
const User = require('../models/User');
const { getFallbackStatus } = require('../config/db');
const { memoryConnections } = require('./connectionController');

const memoryConversations = [];
const memoryPrivateMessages = [];

const checkAcceptedConnection = async (userA, userB) => {
  const uA = userA.toString();
  const uB = userB.toString();

  if (getFallbackStatus()) {
    const conn = memoryConnections.find(
      (c) =>
        ((c.requester.toString() === uA && c.receiver.toString() === uB) ||
          (c.requester.toString() === uB && c.receiver.toString() === uA)) &&
        c.status === 'accepted'
    );
    return !!conn;
  }

  try {
    const conn = await Connection.findOne({
      $or: [
        { requester: uA, receiver: uB },
        { requester: uB, receiver: uA },
      ],
      status: 'accepted',
    });
    return !!conn;
  } catch (error) {
    return false;
  }
};

const getConversations = async (req, res) => {
  const currentUserId = req.user._id.toString();

  if (getFallbackStatus()) {
    const userConvs = memoryConversations.filter((c) =>
      c.participants.some((p) => (p._id || p).toString() === currentUserId)
    );
    return res.json({ success: true, conversations: userConvs });
  }

  try {
    const conversations = await Conversation.find({ participants: currentUserId })
      .populate('participants', 'name avatar location travelStyle targetDestination')
      .sort({ lastMessageAt: -1 });

    res.json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPrivateChatHistory = async (req, res) => {
  const currentUserId = req.user._id.toString();
  const targetUserId = req.params.userId;

  // Verify accepted connection
  const isConnected = await checkAcceptedConnection(currentUserId, targetUserId);
  if (!isConnected) {
    return res.status(403).json({
      success: false,
      message: 'You can only chat with connected travel buddies after accepting a connection request.',
    });
  }

  const conversationId = [currentUserId, targetUserId].sort().join('_');

  if (getFallbackStatus()) {
    const msgs = memoryPrivateMessages.filter((m) => m.conversationId === conversationId);
    return res.json({ success: true, messages: msgs });
  }

  try {
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

    // Mark incoming messages as read
    await Message.updateMany(
      { conversationId, receiver: currentUserId, read: false },
      { read: true }
    );

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const sendPrivateMessage = async (req, res) => {
  const currentUserId = req.user._id.toString();
  const targetUserId = req.params.userId;
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Message text is required' });
  }

  // Security check: Must be accepted travel buddies
  const isConnected = await checkAcceptedConnection(currentUserId, targetUserId);
  if (!isConnected) {
    return res.status(403).json({
      success: false,
      message: 'You can only chat with connected travel buddies after accepting a connection request.',
    });
  }

  const conversationId = [currentUserId, targetUserId].sort().join('_');

  const senderObj = {
    _id: req.user._id,
    name: req.user.name,
    avatar: req.user.avatar,
  };

  const newMsgObj = {
    _id: 'msg_' + Date.now(),
    conversationId,
    sender: senderObj,
    receiver: targetUserId,
    message: message.trim(),
    read: false,
    createdAt: new Date(),
  };

  if (getFallbackStatus()) {
    memoryPrivateMessages.push(newMsgObj);

    let conv = memoryConversations.find((c) => c.conversationId === conversationId);
    if (!conv) {
      conv = {
        _id: 'conv_' + Date.now(),
        conversationId,
        participants: [req.user, { _id: targetUserId, name: 'Buddy' }],
        lastMessage: message.trim(),
        lastMessageAt: new Date(),
      };
      memoryConversations.unshift(conv);
    } else {
      conv.lastMessage = message.trim();
      conv.lastMessageAt = new Date();
    }

    return res.status(201).json({ success: true, message: newMsgObj, conversation: conv });
  }

  try {
    const createdMsg = await Message.create({
      conversationId,
      sender: currentUserId,
      receiver: targetUserId,
      message: message.trim(),
    });

    let conv = await Conversation.findOne({ conversationId });
    if (!conv) {
      conv = await Conversation.create({
        conversationId,
        participants: [currentUserId, targetUserId],
        lastMessage: message.trim(),
        lastMessageAt: new Date(),
      });
    } else {
      conv.lastMessage = message.trim();
      conv.lastMessageAt = new Date();
      await conv.save();
    }

    res.status(201).json({ success: true, message: createdMsg, conversation: conv });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Group chat legacy methods
const memoryMessages = [
  {
    _id: 'msg_1',
    group: 'group_1',
    sender: { _id: 'u1', name: 'Rahul Sharma', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80' },
    message: 'Hey team! Anyone interested in scuba diving at Grand Island in Goa?',
    createdAt: new Date(Date.now() - 3600000 * 4),
  },
];

const getGroupMessages = async (req, res) => {
  const { id } = req.params;
  if (getFallbackStatus()) {
    return res.json(memoryMessages.filter((m) => m.group === id || id === 'group_1'));
  }
  try {
    const messages = await Message.find({ group: id }).populate('sender', 'name avatar').sort({ createdAt: 1 });
    if (messages.length === 0) return res.json(memoryMessages);
    res.json(messages);
  } catch (error) {
    res.json(memoryMessages);
  }
};

const sendMessage = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const newMsg = {
    _id: 'msg_' + Date.now(),
    group: id,
    sender: req.user ? { _id: req.user._id, name: req.user.name, avatar: req.user.avatar } : { _id: 'u1', name: 'Demo Traveler' },
    message,
    createdAt: new Date(),
  };
  memoryMessages.push(newMsg);
  res.status(201).json(newMsg);
};

module.exports = {
  getConversations,
  getPrivateChatHistory,
  sendPrivateMessage,
  getGroupMessages,
  sendMessage,
  checkAcceptedConnection,
};
