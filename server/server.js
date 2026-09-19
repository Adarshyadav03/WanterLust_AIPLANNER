require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const socketAuth = require('./middleware/socketAuth');
const { checkAcceptedConnection } = require('./controllers/messageController');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const tripRoutes = require('./routes/tripRoutes');
const aiRoutes = require('./routes/aiRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const groupRoutes = require('./routes/groupRoutes');
const postRoutes = require('./routes/postRoutes');
const adminRoutes = require('./routes/adminRoutes');
const connectionRoutes = require('./routes/connectionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();
const server = http.createServer(app);

// Connect Database
connectDB();

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Attach Socket.io instance to request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Base Welcome & Health Routes
app.get('/', (req, res) => {
  res.json({
    name: 'WanderLust API',
    version: '1.0.0',
    message: 'Welcome to WanderLust AI Travel Platform API. Please open the React client application at http://localhost:5173',
    status: 'Operational',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      connections: '/api/connections',
      messages: '/api/messages',
      notifications: '/api/notifications',
      destinations: '/api/destinations',
      trips: '/api/trips',
      ai: '/api/ai',
      budget: '/api/budget',
      groups: '/api/groups',
      posts: '/api/posts',
      upload: '/api/upload',
      reviews: '/api/reviews',
      admin: '/api/admin',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'WanderLust API is operational', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
const destinationReviewRoutes = require('./routes/destinationReviewRoutes');
const hotelReviewRoutes = require('./routes/hotelReviewRoutes');
const reviewActionRoutes = require('./routes/reviewActionRoutes');

app.use('/api/destinations', destinationRoutes);
app.use('/api/destinations', destinationReviewRoutes);
app.use('/api/hotels', hotelReviewRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reviews', reviewActionRoutes);

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Expose globals for controller socket access
global.io = io;
const onlineUsers = new Map(); // userId -> socket.id
global.onlineUsers = onlineUsers;

// Socket Authentication Middleware
io.use(socketAuth);

io.on('connection', (socket) => {
  const userId = socket.user._id ? socket.user._id.toString() : socket.id;
  onlineUsers.set(userId, socket.id);

  // Join personal user room for direct notification delivery
  socket.join(userId);

  console.log(`⚡ Socket Connected: ${socket.id} (User: ${socket.user.name} [${userId}])`);

  // Broadcast online status
  io.emit('user_online', { userId, name: socket.user.name });
  io.emit('online_users_list', Array.from(onlineUsers.keys()));

  // 1-to-1 Conversation Room Join
  socket.on('join_conversation', ({ targetUserId }) => {
    const conversationRoom = `conversation:${[userId, targetUserId].sort().join('_')}`;
    socket.join(conversationRoom);
    console.log(`User ${socket.user.name} joined room: ${conversationRoom}`);
  });

  // Real-time 1-to-1 Private Message Event
  socket.on('send_private_message', async ({ receiverId, message }) => {
    if (!message || !receiverId) return;

    // Security check: Must be accepted travel buddies
    const isConnected = await checkAcceptedConnection(userId, receiverId);
    if (!isConnected) {
      return socket.emit('error_message', {
        message: 'You can only chat with connected travel buddies after accepting a request.',
      });
    }

    const conversationId = [userId, receiverId].sort().join('_');
    const conversationRoom = `conversation:${conversationId}`;

    const msgPayload = {
      _id: 'msg_' + Date.now(),
      conversationId,
      sender: {
        _id: userId,
        name: socket.user.name,
        avatar: socket.user.avatar,
      },
      receiver: receiverId,
      message: message.trim(),
      read: false,
      createdAt: new Date(),
    };

    // Emit message to room
    io.to(conversationRoom).emit('receive_private_message', msgPayload);

    // If target user is online but not in room, emit notification
    const targetSocketId = onlineUsers.get(receiverId.toString());
    if (targetSocketId) {
      io.to(targetSocketId).emit('new_message_notification', {
        sender: socket.user,
        message: message.trim(),
        conversationId,
      });
    }
  });

  // Typing indicators 1-to-1
  socket.on('typing_start', ({ receiverId }) => {
    const conversationRoom = `conversation:${[userId, receiverId].sort().join('_')}`;
    socket.to(conversationRoom).emit('typing_start', { senderId: userId, name: socket.user.name });
  });

  socket.on('typing_stop', ({ receiverId }) => {
    const conversationRoom = `conversation:${[userId, receiverId].sort().join('_')}`;
    socket.to(conversationRoom).emit('typing_stop', { senderId: userId });
  });

  // ===================== GROUP SOCKET ROOMS =====================
  socket.on('join_group', ({ groupId }) => {
    const roomName = `group:${groupId}`;
    socket.join(roomName);
    console.log(`User ${socket.user.name} joined Group Room: ${roomName}`);
  });

  socket.on('send_group_message', ({ groupId, message, attachments }) => {
    if (!groupId || (!message && (!attachments || attachments.length === 0))) return;
    const roomName = `group:${groupId}`;

    const groupMsgPayload = {
      _id: 'gmsg_' + Date.now(),
      group: groupId,
      sender: {
        _id: userId,
        name: socket.user.name,
        avatar: socket.user.avatar,
      },
      message: (message || '').trim(),
      attachments: attachments || [],
      createdAt: new Date(),
    };

    io.to(roomName).emit('receive_group_message', groupMsgPayload);
  });

  socket.on('group_typing_start', ({ groupId }) => {
    const roomName = `group:${groupId}`;
    socket.to(roomName).emit('group_typing_start', { senderId: userId, name: socket.user.name });
  });

  socket.on('group_typing_stop', ({ groupId }) => {
    const roomName = `group:${groupId}`;
    socket.to(roomName).emit('group_typing_stop', { senderId: userId });
  });

  // Legacy room join
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('send-message', (data) => {
    io.to(data.group).emit('receive-message', data);
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
    console.log(`🔌 Socket Disconnected: ${socket.id} (User: ${socket.user.name})`);
    io.emit('user_offline', { userId });
    io.emit('online_users_list', Array.from(onlineUsers.keys()));
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`⚠️ Port ${PORT} is already in use by another process. Attempting fallback port ${Number(PORT) + 1}...`);
    setTimeout(() => {
      server.listen(Number(PORT) + 1);
    }, 1000);
  } else {
    console.error('Server listen error:', err.message);
  }
});

server.listen(PORT, () => {
  const actualPort = server.address().port;
  console.log(`🚀 WanderLust Express server running on port ${actualPort} [Mode: ${process.env.NODE_ENV || 'development'}]`);
});
