const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { getFallbackStatus } = require('../config/db');

const memoryPosts = [
  {
    _id: 'post_1',
    author: {
      _id: '65f8a09b1234567890abcde0',
      name: 'Ananya Roy',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    },
    content: 'Backwaters of Kerala are magical! 🌴 Took an early morning kayaking trip through the silent lagoons in Alleppey.',
    images: ['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1000&q=80'],
    destination: 'Kerala',
    tags: ['Nature', 'Backwaters', 'Kayaking'],
    likes: ['65f8a09b1234567890abcdef'],
    savedBy: [],
    comments: [
      {
        _id: 'c1',
        user: { name: 'Rohan Mehta', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80' },
        text: 'Stunning shot! Did you rent a private houseboat too?',
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 5),
  },
  {
    _id: 'post_2',
    author: {
      _id: '65f8a09b1234567890abcdef',
      name: 'Rohan Mehta',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    },
    content: 'Conquered Solang Valley paragliding today in Manali! 🪂 The aerial view of the snow-draped mountains is unforgettable.',
    images: ['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1000&q=80'],
    destination: 'Manali',
    tags: ['Adventure', 'Paragliding', 'Mountains'],
    likes: ['65f8a09b1234567890abcde0'],
    savedBy: [],
    comments: [],
    createdAt: new Date(Date.now() - 3600000 * 12),
  },
];

const getPosts = async (req, res) => {
  if (getFallbackStatus()) {
    return res.json(memoryPosts);
  }

  try {
    const posts = await Post.find()
      .populate('author', 'name avatar email location travelStyle')
      .populate('comments.user', 'name avatar')
      .sort({ createdAt: -1 });
    if (posts.length === 0) return res.json(memoryPosts);
    res.json(posts);
  } catch (error) {
    res.json(memoryPosts);
  }
};

const createPost = async (req, res) => {
  const { content, images, destination, tags } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'Post content is required' });
  }

  const authorObj = req.user
    ? { _id: req.user._id, name: req.user.name, avatar: req.user.avatar }
    : { _id: '65f8a09b1234567890abcdef', name: 'Rohan Mehta', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80' };

  const postPayload = {
    _id: 'post_' + Date.now(),
    author: authorObj,
    content,
    images: Array.isArray(images) ? images.slice(0, 5) : images ? [images] : [],
    destination: destination || 'General',
    tags: tags || ['Travel'],
    likes: [],
    savedBy: [],
    comments: [],
    createdAt: new Date(),
  };

  if (getFallbackStatus()) {
    memoryPosts.unshift(postPayload);
    return res.status(201).json(postPayload);
  }

  try {
    const post = await Post.create({
      author: req.user ? req.user._id : '65f8a09b1234567890abcdef',
      content,
      images: Array.isArray(images) ? images.slice(0, 5) : images ? [images] : [],
      destination: destination || 'General',
      tags: tags || [],
    });
    const populated = await Post.findById(post._id).populate('author', 'name avatar email');
    res.status(201).json(populated);
  } catch (error) {
    memoryPosts.unshift(postPayload);
    res.status(201).json(postPayload);
  }
};

const likePost = async (req, res) => {
  const { id } = req.params;
  const userId = req.user ? req.user._id.toString() : '65f8a09b1234567890abcdef';

  if (getFallbackStatus()) {
    const post = memoryPosts.find((p) => p._id === id);
    if (post) {
      const idx = post.likes.indexOf(userId);
      if (idx > -1) post.likes.splice(idx, 1);
      else post.likes.push(userId);
      return res.json(post);
    }
    return res.status(404).json({ message: 'Post not found' });
  }

  try {
    const post = await Post.findById(id).populate('author', 'name avatar');
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const idx = post.likes.findIndex((l) => l.toString() === userId.toString());
    let isLiked = false;
    if (idx > -1) {
      post.likes.splice(idx, 1);
    } else {
      post.likes.push(userId);
      isLiked = true;
    }
    await post.save();

    // Socket notification on like (if liking someone else's post)
    if (isLiked && post.author._id.toString() !== userId.toString()) {
      const notif = await Notification.create({
        user: post.author._id,
        sender: userId,
        type: 'POST_LIKE',
        message: `${req.user.name} liked your post.`,
        referenceId: post._id.toString(),
      });
      if (req.io) {
        req.io.to(post.author._id.toString()).emit('notification', {
          _id: notif._id,
          sender: { _id: req.user._id, name: req.user.name, avatar: req.user.avatar },
          type: 'POST_LIKE',
          message: notif.message,
          referenceId: post._id,
          createdAt: notif.createdAt,
        });
      }
    }

    const updated = await Post.findById(id)
      .populate('author', 'name avatar')
      .populate('comments.user', 'name avatar');
    return res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const commentPost = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const userId = req.user ? req.user._id.toString() : '65f8a09b1234567890abcdef';

  if (!text) return res.status(400).json({ message: 'Comment text required' });

  if (getFallbackStatus()) {
    const post = memoryPosts.find((p) => p._id === id);
    if (post) {
      const commentObj = {
        _id: 'c_' + Date.now(),
        user: { _id: userId, name: req.user?.name || 'Rohan Mehta', avatar: req.user?.avatar || '' },
        text,
        createdAt: new Date(),
      };
      post.comments.push(commentObj);
      return res.json(post);
    }
    return res.status(404).json({ message: 'Post not found' });
  }

  try {
    const post = await Post.findById(id).populate('author', 'name avatar');
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ user: userId, text });
    await post.save();

    // Socket notification on comment
    if (post.author._id.toString() !== userId.toString()) {
      const notif = await Notification.create({
        user: post.author._id,
        sender: userId,
        type: 'POST_COMMENT',
        message: `${req.user.name} commented on your post: "${text.substring(0, 20)}..."`,
        referenceId: post._id.toString(),
      });
      if (req.io) {
        req.io.to(post.author._id.toString()).emit('notification', {
          _id: notif._id,
          sender: { _id: req.user._id, name: req.user.name, avatar: req.user.avatar },
          type: 'POST_COMMENT',
          message: notif.message,
          referenceId: post._id,
          createdAt: notif.createdAt,
        });
      }
    }

    const updated = await Post.findById(id)
      .populate('author', 'name avatar')
      .populate('comments.user', 'name avatar');
    return res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const savePost = async (req, res) => {
  const { id } = req.params;
  const userId = req.user ? req.user._id.toString() : '65f8a09b1234567890abcdef';

  if (getFallbackStatus()) {
    const post = memoryPosts.find((p) => p._id === id);
    if (post) {
      if (!post.savedBy) post.savedBy = [];
      const idx = post.savedBy.indexOf(userId);
      if (idx > -1) post.savedBy.splice(idx, 1);
      else post.savedBy.push(userId);
      return res.json(post);
    }
    return res.status(404).json({ message: 'Post not found' });
  }

  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (!post.savedBy) post.savedBy = [];
    const idx = post.savedBy.findIndex((s) => s.toString() === userId.toString());
    if (idx > -1) {
      post.savedBy.splice(idx, 1);
    } else {
      post.savedBy.push(userId);
    }
    await post.save();

    const updated = await Post.findById(id)
      .populate('author', 'name avatar')
      .populate('comments.user', 'name avatar');
    return res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePost = async (req, res) => {
  const { id } = req.params;

  if (getFallbackStatus()) {
    const idx = memoryPosts.findIndex((p) => p._id === id);
    if (idx !== -1) {
      memoryPosts.splice(idx, 1);
      return res.json({ message: 'Post deleted' });
    }
  }

  try {
    await Post.findByIdAndDelete(id);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPosts,
  createPost,
  likePost,
  commentPost,
  savePost,
  deletePost,
  memoryPosts,
};
