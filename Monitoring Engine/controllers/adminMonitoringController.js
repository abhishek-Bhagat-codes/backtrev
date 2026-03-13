/**
 * Admin Monitoring Controller
 *
 * Handles HTTP requests for the police admin dashboard monitoring APIs.
 */

const AdminMonitoringService = require("../services/AdminMonitoringService");

/**
 * GET /api/admin/monitoring/live
 * Returns all currently active users and their latest monitoring status.
 */
async function getLiveMonitoring(req, res) {
  try {
    const status = await AdminMonitoringService.getLiveMonitoringStatus();
    res.json(status);
  } catch (err) {
    console.error("[AdminMonitoring] getLiveMonitoring error:", err);
    res.status(500).json({ error: "Failed to fetch live monitoring status" });
  }
}

/**
 * GET /api/admin/monitoring/user/:user_id
 * Returns the latest monitoring state for a specific user.
 */
async function getUserMonitoring(req, res) {
  try {
    const { user_id } = req.params;
    const status = await AdminMonitoringService.getUserMonitoringStatus(user_id);

    if (!status) {
      return res.status(404).json({
        error: "User not found or has no active trip",
        user_id
      });
    }

    res.json(status);
  } catch (err) {
    console.error("[AdminMonitoring] getUserMonitoring error:", err);
    res.status(500).json({ error: "Failed to fetch user monitoring status" });
  }
}

/**
 * GET /api/admin/monitoring/trips
 * Returns all currently active trips.
 */
async function getActiveTrips(req, res) {
  try {
    const trips = await AdminMonitoringService.getActiveTripsForAdmin();
    res.json(trips);
  } catch (err) {
    console.error("[AdminMonitoring] getActiveTrips error:", err);
    res.status(500).json({ error: "Failed to fetch active trips" });
  }
}

module.exports = {
  getLiveMonitoring,
  getUserMonitoring,
  getActiveTrips
};
