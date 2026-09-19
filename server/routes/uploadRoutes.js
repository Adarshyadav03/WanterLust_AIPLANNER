const express = require('express');
const router = express.Router();
const { uploadImage } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const { uploadMemoryImages } = require('../middleware/uploadMiddleware');

router.post('/image', protect, uploadMemoryImages, uploadImage);

module.exports = router;
