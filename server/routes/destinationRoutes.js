const express = require('express');
const router = express.Router();
const {
  getDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
} = require('../controllers/destinationController');
const { fetchWeatherForDestination } = require('../services/weatherService');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getDestinations);
router.get('/:id', getDestinationById);
router.get('/:id/weather', async (req, res) => {
  try {
    const weather = await fetchWeatherForDestination(req.params.id);
    res.json(weather);
  } catch (err) {
    res.status(500).json({ message: 'Weather service error' });
  }
});
router.post('/', protect, adminOnly, createDestination);
router.put('/:id', protect, adminOnly, updateDestination);
router.delete('/:id', protect, adminOnly, deleteDestination);

module.exports = router;
