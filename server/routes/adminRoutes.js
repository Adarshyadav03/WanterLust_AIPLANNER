const express = require('express');
const router = express.Router();
const { getDashboardStats, getUsers, getReports } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, adminOnly, getDashboardStats);
router.get('/users', protect, adminOnly, getUsers);
router.get('/reports', protect, adminOnly, getReports);

module.exports = router;
