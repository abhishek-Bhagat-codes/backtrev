/**
 * Admin Zone Controller
 *
 * Risk zone management for the police admin dashboard.
 * Reuses existing zone logic from geofence module.
 */

const db = require("../config/db");
const { getZones } = require("../geofence");

/**
 * GET /api/admin/zones
 * Returns all configured risk zones.
 */
async function getAllZones(req, res) {
  try {
    const zones = await getZones();
    res.json(zones);
  } catch (err) {
    console.error("[AdminZone] getAllZones error:", err);
    res.status(500).json({ error: "Failed to fetch zones" });
  }
}

/**
 * POST /api/admin/zones
 * Creates a new risk zone.
 * Body: { name, latitude, longitude, radius, type?, expiry_type?, expiry_time?, risk_level? }
 */
function createZone(req, res) {
  const {
    name,
    latitude,
    longitude,
    radius,
    type,
    expiry_type,
    expiry_time,
    risk_level
  } = req.body;

  if (!name || latitude == null || longitude == null || radius == null) {
    return res.status(400).json({
      error: "name, latitude, longitude and radius are required"
    });
  }

  const stmt = db.prepare(
    `INSERT INTO risk_zones (name, latitude, longitude, radius, type, expiry_type, expiry_time, risk_level)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  stmt.run(
    name,
    latitude,
    longitude,
    radius,
    type || null,
    expiry_type || null,
    expiry_time || null,
    risk_level || null,
    function (err) {
      if (err) {
        console.error("[AdminZone] createZone error:", err.message);
        return res.status(500).json({ error: "Failed to create zone" });
      }

      res.status(201).json({
        id: this.lastID,
        name,
        latitude,
        longitude,
        radius,
        type: type || null,
        expiry_type: expiry_type || null,
        expiry_time: expiry_time || null,
        risk_level: risk_level || null
      });
    }
  );
}

/**
 * DELETE /api/admin/zones/:id
 * Deletes a risk zone by ID.
 */
function deleteZone(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id < 1) {
    return res.status(400).json({ error: "Invalid zone ID" });
  }

  db.run("DELETE FROM risk_zones WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("[AdminZone] deleteZone error:", err.message);
      return res.status(500).json({ error: "Failed to delete zone" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Zone not found", id });
    }

    res.json({ success: true, id, message: "Zone deleted" });
  });
}

module.exports = {
  getAllZones,
  createZone,
  deleteZone
};
