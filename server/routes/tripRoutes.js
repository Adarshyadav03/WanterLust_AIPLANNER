const express = require('express');
const router = express.Router();
const {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
} = require('../controllers/tripController');
const { getExpensesByTrip, createExpense } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getTrips);
router.get('/:id', protect, getTripById);
router.post('/', protect, createTrip);
router.put('/:id', protect, updateTrip);
router.delete('/:id', protect, deleteTrip);

// Budget expenses sub-routes
router.get('/:tripId/expenses', protect, getExpensesByTrip);
router.post('/:tripId/expenses', protect, createExpense);

module.exports = router;
