/**
 * Admin Zone Routes
 *
 * Risk zone management for the police admin dashboard.
 */

const express = require("express");
const adminZoneController = require("../controllers/adminZoneController");

const router = express.Router();

// GET /api/admin/zones - list all risk zones
router.get("/", adminZoneController.getAllZones);

// POST /api/admin/zones - create a new risk zone
router.post("/", adminZoneController.createZone);

// DELETE /api/admin/zones/:id - delete a risk zone
router.delete("/:id", adminZoneController.deleteZone);

module.exports = router;
