const express = require("express");
const router = express.Router();
const currentLocationController = require("../controllers/currentLocation.controller");
const auth = require("../middleware/auth");

// Protected routes
router.post("/", auth, currentLocationController.saveCurrentLocation);
router.put("/", auth, currentLocationController.updateCurrentLocation);
router.get("/", auth, currentLocationController.fetchCurrentLocation);

module.exports = router;

