const Notification = require('../models/Notification');
const { getFallbackStatus } = require('../config/db');
const { memoryNotifications } = require('./connectionController');

const getNotifications = async (req, res) => {
  const userId = req.user._id.toString();

  if (getFallbackStatus()) {
    const list = memoryNotifications.filter((n) => n.user.toString() === userId || n.user === userId);
    return res.json({ success: true, notifications: list });
  }

  try {
    const notifications = await Notification.find({ user: userId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, notifications });
  } catch (error) {
    const list = memoryNotifications.filter((n) => n.user.toString() === userId || n.user === userId);
    res.json({ success: true, notifications: list });
  }
};

const markNotificationsRead = async (req, res) => {
  const userId = req.user._id.toString();

  if (getFallbackStatus()) {
    memoryNotifications.forEach((n) => {
      if (n.user.toString() === userId || n.user === userId) {
        n.read = true;
        n.isRead = true;
      }
    });
    return res.json({ success: true, message: 'All notifications marked as read' });
  }

  try {
    await Notification.updateMany({ user: userId }, { read: true, isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getNotifications, markNotificationsRead };
