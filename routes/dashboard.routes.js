const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const auth = require('../middleware/auth');

// Dashboard routes (protected – admin must be authenticated)
router.get('/tourists', auth, dashboardController.fetchTourists);
router.get('/alerts', auth, dashboardController.fetchAlerts);
router.get('/zones', auth, dashboardController.fetchZones);

module.exports = router;
