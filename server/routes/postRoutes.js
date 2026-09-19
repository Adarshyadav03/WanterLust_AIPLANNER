const express = require('express');
const router = express.Router();
const { getPosts, createPost, likePost, commentPost, savePost, deletePost } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getPosts);
router.post('/', protect, createPost);
router.post('/:id/like', protect, likePost);
router.post('/:id/comment', protect, commentPost);
router.post('/:id/comments', protect, commentPost);
router.post('/:id/save', protect, savePost);
router.delete('/:id', protect, deletePost);

module.exports = router;
