const express = require("express");
const router = express.Router();
const tripController = require("../controllers/trip.controller");
const auth = require("../middleware/auth");

// Protected routes
router.post("/", auth, tripController.saveTrip);
router.put("/:tripId", auth, tripController.updateTrip);
router.get("/", auth, tripController.fetchAllTrips); // Fetch all trips (must come before /:tripId)
router.get("/:tripId", auth, tripController.fetchTrip); // Fetch single trip

module.exports = router;


