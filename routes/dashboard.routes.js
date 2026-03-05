const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');

// Dashboard routes 
router.get('/tourists', auth, requireAdmin, dashboardController.fetchTourists);
router.get('/alerts', auth, requireAdmin, dashboardController.fetchAlerts);
router.get('/zones', auth, requireAdmin, dashboardController.fetchZones);

module.exports = router;
