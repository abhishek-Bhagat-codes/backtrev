const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const auth = require('../middleware/auth');
const requirePolice = require('../middleware/police');

// Dashboard routes 
router.get('/tourists', auth, requirePolice, dashboardController.fetchTourists);
router.get('/alerts', auth, requirePolice, dashboardController.fetchAlerts);
router.get('/zones', auth, requirePolice, dashboardController.fetchZones);

module.exports = router;
