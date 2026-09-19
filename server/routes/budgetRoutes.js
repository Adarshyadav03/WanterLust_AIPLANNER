const express = require('express');
const router = express.Router();
const { updateExpense, deleteExpense } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.put('/expenses/:id', protect, updateExpense);
router.delete('/expenses/:id', protect, deleteExpense);

module.exports = router;
