const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

// Dashboard routes (no auth for admin dashboard - add auth in production)
router.get('/tourists', dashboardController.fetchTourists);
router.get('/alerts', dashboardController.fetchAlerts);
router.get('/zones', dashboardController.fetchZones);

module.exports = router;
