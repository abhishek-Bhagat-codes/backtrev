const express = require("express");
const router = express.Router();
const geoFencingController = require("../controllers/geoFencing.controller");
const auth = require("../middleware/auth");

// Protected routes
router.post("/", auth, geoFencingController.createGeofence);
router.put("/:geofenceId", auth, geoFencingController.updateGeofence);
router.get("/", auth, geoFencingController.fetchAllGeofences);
router.get("/:geofenceId", auth, geoFencingController.fetchGeofence);
router.delete("/:geofenceId", auth, geoFencingController.deleteGeofence);

module.exports = router;

