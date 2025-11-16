const express = require("express");
const router = express.Router();
const emergencyNotificationController = require("../controllers/emergencyNotification.controller");
const auth = require("../middleware/auth");

// Protected routes
router.post("/sos", auth, emergencyNotificationController.createSOS); // Create SOS emergency notification
router.get("/", auth, emergencyNotificationController.fetchAllEmergencyNotifications); // Fetch all notifications (must come before /:notificationId)
router.get("/:notificationId", auth, emergencyNotificationController.fetchEmergencyNotification); // Fetch single notification

module.exports = router;

