const express = require("express");
const router = express.Router();
const sosNotificationController = require("../controllers/sosNotification.controller");
const auth = require("../middleware/auth");

// Routes
router.get("/all", sosNotificationController.fetchAllSOSNotificationsWithLimit); // Fetch all SOS notifications with limit (public, no auth required)
// Protected routes
router.get("/", auth, sosNotificationController.fetchAllSOSNotifications); // Fetch all SOS notifications for user (must come before /:sosNotificationId)
router.get("/:sosNotificationId", auth, sosNotificationController.fetchSOSNotification); // Fetch single SOS notification

module.exports = router;

