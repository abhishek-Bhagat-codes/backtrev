/**
 * Admin Monitoring Routes
 *
 * Police dashboard APIs for monitoring tourists in real time.
 */

const express = require("express");
const adminMonitoringController = require("../controllers/adminMonitoringController");

const router = express.Router();

// GET /api/admin/monitoring/live - all active users with latest status
router.get("/live", adminMonitoringController.getLiveMonitoring);

// GET /api/admin/monitoring/user/:user_id - single user monitoring
router.get("/user/:user_id", adminMonitoringController.getUserMonitoring);

// GET /api/admin/monitoring/trips - all active trips
router.get("/trips", adminMonitoringController.getActiveTrips);

module.exports = router;
