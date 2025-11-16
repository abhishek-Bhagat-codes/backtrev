const express = require("express");
const router = express.Router();
const safetyScoreController = require("../controllers/safetyScore.controller");
const auth = require("../middleware/auth");

// Protected routes
router.get("/", auth, safetyScoreController.fetchSafetyScore);

module.exports = router;

