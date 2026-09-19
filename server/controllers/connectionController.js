const Connection = require('../models/Connection');
const Notification = require('../models/Notification');
const User = require('../models/User');
const mongoose = require('mongoose');
const { getFallbackStatus } = require('../config/db');

// In-Memory Fallback storage for connections if DB is offline or for non-ObjectId demo IDs
const memoryConnections = [];
const memoryNotifications = [];

const getSocketIO = () => global.io;
const getOnlineUsersMap = () => global.onlineUsers || new Map();

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const sendConnectionRequest = async (req, res) => {
  const requesterId = req.user._id.toString();
  const receiverId = req.params.userId;

  if (requesterId === receiverId) {
    return res.status(400).json({ success: false, message: 'You cannot connect with yourself' });
  }

  // If DB fallback mode OR invalid ObjectId format, use memory storage
  if (getFallbackStatus() || !isValidObjectId(requesterId) || !isValidObjectId(receiverId)) {
    const existing = memoryConnections.find(
      (c) =>
        (c.requester.toString() === requesterId && c.receiver.toString() === receiverId) ||
        (c.requester.toString() === receiverId && c.receiver.toString() === requesterId)
    );

    if (existing) {
      if (existing.status === 'pending') {
        return res.status(400).json({ success: false, message: 'Connection request already pending' });
      }
      if (existing.status === 'accepted') {
        return res.status(400).json({ success: false, message: 'You are already connected' });
      }
      existing.status = 'pending';
      existing.requester = requesterId;
      existing.receiver = receiverId;
      return res.json({ success: true, message: 'Connection request sent', connection: existing });
    }

    const newConn = {
      _id: 'conn_' + Date.now(),
      requester: requesterId,
      receiver: receiverId,
      status: 'pending',
      createdAt: new Date(),
    };
    memoryConnections.push(newConn);

    // Create Notification
    const notifObj = {
      _id: 'notif_' + Date.now(),
      user: receiverId,
      sender: { _id: requesterId, name: req.user.name, avatar: req.user.avatar },
      type: 'CONNECTION_REQUEST',
      message: `${req.user.name} sent you a travel buddy request.`,
      referenceId: newConn._id,
      read: false,
      isRead: false,
      createdAt: new Date(),
    };
    memoryNotifications.unshift(notifObj);

    // Emit Socket Event if target user online
    emitSocketNotification(receiverId, 'connection_request', {
      connectionId: newConn._id,
      sender: { id: requesterId, name: req.user.name, avatar: req.user.avatar },
      message: notifObj.message,
    });

    return res.status(201).json({ success: true, message: 'Connection request sent', connection: newConn });
  }

  try {
    let connection = await Connection.findOne({
      $or: [
        { requester: requesterId, receiver: receiverId },
        { requester: receiverId, receiver: requesterId },
      ],
    });

    if (connection) {
      if (connection.status === 'pending') {
        return res.status(400).json({ success: false, message: 'Connection request already pending' });
      }
      if (connection.status === 'accepted') {
        return res.status(400).json({ success: false, message: 'You are already connected' });
      }
      connection.status = 'pending';
      connection.requester = requesterId;
      connection.receiver = receiverId;
      await connection.save();
    } else {
      connection = await Connection.create({
        requester: requesterId,
        receiver: receiverId,
        status: 'pending',
      });
    }

    // Create Notification in DB
    try {
      await Notification.create({
        user: receiverId,
        sender: requesterId,
        type: 'CONNECTION_REQUEST',
        message: `${req.user.name} sent you a travel buddy request.`,
        referenceId: connection._id,
      });
    } catch (e) {
      console.warn('Notification DB create warning:', e.message);
    }

    // Emit Socket Event
    emitSocketNotification(receiverId, 'connection_request', {
      connectionId: connection._id,
      sender: { id: requesterId, name: req.user.name, avatar: req.user.avatar },
      message: `${req.user.name} sent you a travel buddy request.`,
    });

    res.status(201).json({ success: true, message: 'Connection request sent', connection });
  } catch (error) {
    // Fallback to memory on CastError or DB error
    const newConn = {
      _id: 'conn_' + Date.now(),
      requester: requesterId,
      receiver: receiverId,
      status: 'pending',
      createdAt: new Date(),
    };
    memoryConnections.push(newConn);
    res.status(201).json({ success: true, message: 'Connection request sent', connection: newConn });
  }
};

const getConnectionStatus = async (req, res) => {
  const currentUserId = req.user._id.toString();
  const targetUserId = req.params.userId;

  if (getFallbackStatus() || !isValidObjectId(currentUserId) || !isValidObjectId(targetUserId)) {
    const conn = memoryConnections.find(
      (c) =>
        (c.requester.toString() === currentUserId && c.receiver.toString() === targetUserId) ||
        (c.requester.toString() === targetUserId && c.receiver.toString() === currentUserId)
    );

    if (!conn) {
      return res.json({ success: true, status: 'none', direction: 'none' });
    }

    const direction = conn.requester.toString() === currentUserId ? 'sent' : 'received';
    return res.json({
      success: true,
      status: conn.status,
      direction,
      connectionId: conn._id,
    });
  }

  try {
    const conn = await Connection.findOne({
      $or: [
        { requester: currentUserId, receiver: targetUserId },
        { requester: targetUserId, receiver: currentUserId },
      ],
    });

    if (!conn) {
      return res.json({ success: true, status: 'none', direction: 'none' });
    }

    const direction = conn.requester.toString() === currentUserId ? 'sent' : 'received';
    res.json({
      success: true,
      status: conn.status,
      direction,
      connectionId: conn._id,
    });
  } catch (error) {
    const conn = memoryConnections.find(
      (c) =>
        (c.requester.toString() === currentUserId && c.receiver.toString() === targetUserId) ||
        (c.requester.toString() === targetUserId && c.receiver.toString() === currentUserId)
    );
    if (conn) {
      const direction = conn.requester.toString() === currentUserId ? 'sent' : 'received';
      return res.json({ success: true, status: conn.status, direction, connectionId: conn._id });
    }
    res.json({ success: true, status: 'none', direction: 'none' });
  }
};

const acceptConnection = async (req, res) => {
  const connectionId = req.params.connectionId;
  const currentUserId = req.user._id.toString();

  if (getFallbackStatus() || !isValidObjectId(connectionId)) {
    const conn = memoryConnections.find((c) => c._id === connectionId);
    if (!conn) {
      return res.status(404).json({ success: false, message: 'Connection request not found' });
    }
    if (conn.receiver.toString() !== currentUserId) {
      return res.status(403).json({ success: false, message: 'Only the request recipient can accept' });
    }

    conn.status = 'accepted';

    // Notification for Requester
    const notifObj = {
      _id: 'notif_' + Date.now(),
      user: conn.requester,
      sender: { _id: currentUserId, name: req.user.name, avatar: req.user.avatar },
      type: 'CONNECTION_ACCEPTED',
      message: `${req.user.name} accepted your travel buddy request.`,
      referenceId: conn._id,
      read: false,
      isRead: false,
      createdAt: new Date(),
    };
    memoryNotifications.unshift(notifObj);

    emitSocketNotification(conn.requester, 'connection_accepted', {
      connectionId: conn._id,
      sender: { id: currentUserId, name: req.user.name, avatar: req.user.avatar },
      message: notifObj.message,
    });

    return res.json({ success: true, message: 'Connection accepted', connection: conn });
  }

  try {
    const conn = await Connection.findById(connectionId);
    if (!conn) {
      return res.status(404).json({ success: false, message: 'Connection request not found' });
    }

    if (conn.receiver.toString() !== currentUserId) {
      return res.status(403).json({ success: false, message: 'Only the recipient can accept' });
    }

    conn.status = 'accepted';
    await conn.save();

    try {
      await Notification.create({
        user: conn.requester,
        sender: currentUserId,
        type: 'CONNECTION_ACCEPTED',
        message: `${req.user.name} accepted your travel buddy request.`,
        referenceId: conn._id,
      });
    } catch (e) {
      console.warn('Notif error:', e.message);
    }

    emitSocketNotification(conn.requester, 'connection_accepted', {
      connectionId: conn._id,
      sender: { id: currentUserId, name: req.user.name, avatar: req.user.avatar },
      message: `${req.user.name} accepted your travel buddy request.`,
    });

    res.json({ success: true, message: 'Connection accepted', connection: conn });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const rejectConnection = async (req, res) => {
  const connectionId = req.params.connectionId;

  if (getFallbackStatus() || !isValidObjectId(connectionId)) {
    const conn = memoryConnections.find((c) => c._id === connectionId);
    if (conn) {
      conn.status = 'rejected';
      return res.json({ success: true, message: 'Connection request rejected' });
    }
    return res.status(404).json({ success: false, message: 'Connection not found' });
  }

  try {
    const conn = await Connection.findById(connectionId);
    if (conn) {
      conn.status = 'rejected';
      await conn.save();
      return res.json({ success: true, message: 'Connection request rejected' });
    }
    res.status(404).json({ success: false, message: 'Connection not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyRequests = async (req, res) => {
  const currentUserId = req.user._id.toString();

  if (getFallbackStatus() || !isValidObjectId(currentUserId)) {
    const received = memoryConnections.filter(
      (c) => c.receiver.toString() === currentUserId && c.status === 'pending'
    );
    const sent = memoryConnections.filter(
      (c) => c.requester.toString() === currentUserId && c.status === 'pending'
    );
    return res.json({ success: true, received, sent });
  }

  try {
    const received = await Connection.find({ receiver: currentUserId, status: 'pending' }).populate(
      'requester',
      'name avatar location bio travelStyle budget targetDestination'
    );
    const sent = await Connection.find({ requester: currentUserId, status: 'pending' }).populate(
      'receiver',
      'name avatar location bio travelStyle budget targetDestination'
    );

    res.json({ success: true, received, sent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyFriends = async (req, res) => {
  const currentUserId = req.user._id.toString();

  if (getFallbackStatus() || !isValidObjectId(currentUserId)) {
    const friends = memoryConnections
      .filter((c) => (c.requester.toString() === currentUserId || c.receiver.toString() === currentUserId) && c.status === 'accepted')
      .map((c) => {
        const friendId = c.requester.toString() === currentUserId ? c.receiver.toString() : c.requester.toString();
        return { _id: friendId, connectionId: c._id };
      });
    return res.json({ success: true, friends });
  }

  try {
    const connections = await Connection.find({
      $or: [{ requester: currentUserId }, { receiver: currentUserId }],
      status: 'accepted',
    }).populate('requester receiver', 'name email avatar location bio travelStyle budget targetDestination interests');

    const friends = connections.map((c) => {
      const friendObj = c.requester._id.toString() === currentUserId ? c.receiver : c.requester;
      return {
        ...(friendObj ? friendObj.toObject() : {}),
        connectionId: c._id,
      };
    });

    res.json({ success: true, friends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeConnection = async (req, res) => {
  const currentUserId = req.user._id.toString();
  const targetUserId = req.params.userId;

  if (getFallbackStatus() || !isValidObjectId(currentUserId) || !isValidObjectId(targetUserId)) {
    const idx = memoryConnections.findIndex(
      (c) =>
        (c.requester.toString() === currentUserId && c.receiver.toString() === targetUserId) ||
        (c.requester.toString() === targetUserId && c.receiver.toString() === currentUserId)
    );
    if (idx !== -1) memoryConnections.splice(idx, 1);
    return res.json({ success: true, message: 'Connection removed' });
  }

  try {
    await Connection.findOneAndDelete({
      $or: [
        { requester: currentUserId, receiver: targetUserId },
        { requester: targetUserId, receiver: currentUserId },
      ],
    });
    res.json({ success: true, message: 'Connection removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const emitSocketNotification = (targetUserId, event, data) => {
  const io = getSocketIO();
  const onlineUsers = getOnlineUsersMap();
  if (io && targetUserId) {
    const socketId = onlineUsers.get(targetUserId.toString());
    if (socketId) {
      io.to(socketId).emit(event, data);
    }
  }
};

module.exports = {
  sendConnectionRequest,
  getConnectionStatus,
  acceptConnection,
  rejectConnection,
  getMyRequests,
  getMyFriends,
  removeConnection,
  memoryConnections,
  memoryNotifications,
};
