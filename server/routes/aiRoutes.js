const express = require('express');
const router = express.Router();
const { generateItinerary } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate-itinerary', protect, generateItinerary);

module.exports = router;
