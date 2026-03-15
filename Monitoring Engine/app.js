/**
 * Travira Monitoring Engine - Express Application
 *
 * Configures the Express app and mounts all routes including
 * Police Admin Dashboard APIs.
 */

const express = require("express");
const { getRoute } = require("./route");
const { isDeviated, getDistanceFromRoute } = require("./deviation");
const { checkZones, getZones } = require("./geofence");
const { calculateSafetyScore } = require("./services/safetyScoreEngine");
const {
  predictMovementAnomaly,
  buildFeatures
} = require("./services/anomalyDetectionService");
const db = require("./config/db");

const adminMonitoringRoutes = require("./routes/adminMonitoringRoutes");
const adminZoneRoutes = require("./routes/adminZoneRoutes");

const app = express();

app.use(express.json());

// ========== Police Admin Dashboard APIs ==========
app.use("/api/admin/monitoring", adminMonitoringRoutes);
app.use("/api/admin/zones", adminZoneRoutes);

// ========== Core APIs ==========

// Anomaly prediction API (registered early for real-time /location)
app.post("/predictAnomaly", async (req, res) => {
  try {
    const { user_id, trip_id, lat, lng, speed, timestamp } = req.body;

    if (lat == null || lng == null) {
      return res
        .status(400)
        .json({ error: "lat and lng are required" });
    }

    const features = buildFeatures({
      lat,
      lng,
      speed: speed ?? 0,
      timestamp: timestamp || new Date().toISOString()
    });

    const anomaly = await predictMovementAnomaly(features);
    res.json({
      anomaly_score: anomaly.anomaly_score,
      is_anomaly: anomaly.is_anomaly
    });
  } catch (e) {
    console.error("/predictAnomaly error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new trip and store expected route in DB
app.post("/startTrip", async (req, res) => {
  try {
    const { user_id, origin, destination } = req.body;

    if (!user_id || !origin || !destination) {
      return res
        .status(400)
        .json({ error: "user_id, origin and destination are required" });
    }

    const expectedRoutePoints = await getRoute(origin, destination);

    const tripStmt = db.prepare(
      `INSERT INTO user_trips (user_id, origin_lat, origin_lon, destination_lat, destination_lon)
       VALUES (?, ?, ?, ?, ?)`
    );

    tripStmt.run(
      user_id,
      origin.lat,
      origin.lng,
      destination.lat,
      destination.lng,
      function (err) {
        if (err) {
          console.error("Error creating trip:", err.message);
          return res
            .status(500)
            .json({ error: "Failed to create trip in database" });
        }

        const trip_id = this.lastID;

        const routeStmt = db.prepare(
          `INSERT INTO routes (trip_id, expected_route) VALUES (?, ?)`
        );

        routeStmt.run(trip_id, JSON.stringify(expectedRoutePoints), routeErr => {
          if (routeErr) {
            console.error("Error saving route:", routeErr.message);
            return res
              .status(500)
              .json({ error: "Failed to save expected route" });
          }

          return res.json({
            status: "trip_started",
            user_id,
            trip_id,
            routePoints: expectedRoutePoints.length,
            routePoints1: expectedRoutePoints
          });
        });
      }
    );
  } catch (e) {
    console.error("startTrip error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a zone (stores in DB)
app.post("/zones", (req, res) => {
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
        console.error("Error inserting zone:", err.message);
        return res.status(500).json({ error: "Failed to create zone" });
      }

      res.status(201).json({
        id: this.lastID,
        name,
        latitude,
        longitude,
        radius,
        type,
        expiry_type,
        expiry_time,
        risk_level
      });
    }
  );
});

// List all zones (legacy endpoint; admin uses /api/admin/zones)
app.get("/zones", async (req, res) => {
  try {
    const zones = await getZones();
    res.json(zones);
  } catch (e) {
    res.status(500).json({ error: "Failed to load zones" });
  }
});

// List all users and their trips
app.get("/users/trips", (req, res) => {
  const sql = `
    SELECT trip_id, user_id, origin_lat, origin_lon,
           destination_lat, destination_lon, start_time, status
    FROM user_trips
    ORDER BY user_id, start_time
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Error loading user trips:", err.message);
      return res.status(500).json({ error: "Failed to load user trips" });
    }

    const usersMap = new Map();

    rows.forEach(row => {
      if (!usersMap.has(row.user_id)) {
        usersMap.set(row.user_id, {
          user_id: row.user_id,
          trips: []
        });
      }

      usersMap.get(row.user_id).trips.push({
        trip_id: row.trip_id,
        origin: {
          lat: row.origin_lat,
          lng: row.origin_lon
        },
        destination: {
          lat: row.destination_lat,
          lng: row.destination_lon
        },
        start_time: row.start_time,
        status: row.status
      });
    });

    res.json(Array.from(usersMap.values()));
  });
});

// Route generation helper
app.post("/route", async (req, res) => {
  try {
    const { origin, destination } = req.body;

    if (!origin || !destination) {
      return res
        .status(400)
        .json({ error: "origin and destination are required" });
    }

    const points = await getRoute(origin, destination);

    res.json({
      status: "route_generated",
      routePoints: points.length,
      coordinates: points
    });
  } catch (e) {
    console.error("/route error:", e);
    res.status(500).json({ error: "Failed to generate route" });
  }
});

function checkProlongedInactivity(user_id, trip_id) {
  return new Promise((resolve, reject) => {
    const twentyMinAgo = new Date(Date.now() - 20 * 60 * 1000).toISOString();
    const params = trip_id
      ? [user_id, trip_id, twentyMinAgo]
      : [user_id, twentyMinAgo];
    const sql = trip_id
      ? `SELECT speed, timestamp FROM user_location_history
         WHERE user_id = ? AND trip_id = ? AND timestamp >= ?
         ORDER BY timestamp ASC`
      : `SELECT speed, timestamp FROM user_location_history
         WHERE user_id = ? AND trip_id IS NULL AND timestamp >= ?
         ORDER BY timestamp ASC`;

    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      if (!rows || rows.length < 2) return resolve(false);

      const firstTs = new Date(rows[0].timestamp).getTime();
      const lastTs = new Date(rows[rows.length - 1].timestamp).getTime();
      const spanMinutes = (lastTs - firstTs) / (60 * 1000);

      const allLowSpeed = rows.every(r => {
        const s = r.speed != null ? r.speed : 0;
        return s < 0.3;
      });

      resolve(spanMinutes >= 20 && allLowSpeed);
    });
  });
}

function getPreviousSafetyScore(user_id, trip_id) {
  return new Promise((resolve, reject) => {
    const sql = trip_id
      ? `SELECT score FROM safety_scores WHERE user_id = ? AND trip_id = ?
         ORDER BY id DESC LIMIT 1`
      : `SELECT score FROM safety_scores WHERE user_id = ? AND trip_id IS NULL
         ORDER BY id DESC LIMIT 1`;
    const params = trip_id ? [user_id, trip_id] : [user_id];

    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row ? row.score : 100);
    });
  });
}

function saveSafetyScore(user_id, trip_id, score, level) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO safety_scores (user_id, trip_id, score, level) VALUES (?, ?, ?, ?)`,
      [user_id, trip_id || null, score, level],
      function (err) {
        if (err) return reject(err);
        resolve(this.lastID);
      }
    );
  });
}

app.post("/location", async (req, res) => {
  const { user_id, trip_id, lat, lng, speed, timestamp } = req.body;

  if (!user_id || lat == null || lng == null) {
    return res
      .status(400)
      .json({ error: "user_id, lat and lng are required in body" });
  }

  if (trip_id != null) {
    try {
      const tripRow = await new Promise((resolve, reject) => {
        db.get(
          "SELECT user_id FROM user_trips WHERE trip_id = ?",
          [trip_id],
          (err, row) => (err ? reject(err) : resolve(row))
        );
      });

      if (!tripRow || tripRow.user_id !== user_id) {
        return res
          .status(404)
          .json({ error: "Trip not found for this user" });
      }
    } catch (e) {
      console.error("Error validating trip:", e);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  const ts = timestamp || new Date().toISOString();
  const user = { lat, lng };

  try {
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO user_location_history (user_id, trip_id, latitude, longitude, speed, timestamp)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user_id, trip_id || null, lat, lng, speed ?? null, ts],
        err => (err ? reject(err) : resolve())
      );
    }).catch(err => {
      console.error("Error saving location history:", err.message);
    });

    let routeForDeviation = null;
    if (trip_id) {
      try {
        const row = await new Promise((resolve, reject) => {
          db.get(
            "SELECT expected_route FROM routes WHERE trip_id = ?",
            [trip_id],
            (err, r) => (err ? reject(err) : resolve(r))
          );
        });
        if (row?.expected_route) {
          routeForDeviation = JSON.parse(row.expected_route);
        }
      } catch (e) {}
    }

    const deviated =
      Array.isArray(routeForDeviation) && routeForDeviation.length > 0
        ? isDeviated(user, routeForDeviation)
        : false;

    if (deviated) {
      console.log("⚠️ TRIP DEVIATION DETECTED");
    }

    const zoneAlerts = await checkZones({ lat, lng });
    zoneAlerts.forEach(a => {
      console.log(`📍 ${a.status} ${a.zone} (${Math.round(a.distance)}m)`);
    });

    const prolongedInactivity = await checkProlongedInactivity(user_id, trip_id);

    const distFromRoute =
      Array.isArray(routeForDeviation) && routeForDeviation.length > 0
        ? getDistanceFromRoute(user, routeForDeviation)
        : null;
    const distToRiskZone =
      zoneAlerts.length > 0
        ? Math.min(...zoneAlerts.map(z => z.distance ?? Infinity))
        : null;
    const distToRiskZoneFinal = distToRiskZone !== Infinity ? distToRiskZone : null;

    const features = buildFeatures({
      lat,
      lng,
      speed: speed ?? 0,
      timestamp: ts,
      distance_from_expected_route: distFromRoute,
      distance_to_risk_zone: distToRiskZoneFinal
    });
    const anomaly = await predictMovementAnomaly(features);

    const previousScore = await getPreviousSafetyScore(user_id, trip_id);
    const userData = { speed: speed ?? 0, timestamp: ts };
    const { score: safety_score, level: safety_level } = calculateSafetyScore(
      userData,
      deviated,
      zoneAlerts,
      prolongedInactivity,
      previousScore,
      anomaly
    );

    await saveSafetyScore(user_id, trip_id, safety_score, safety_level);

    res.json({
      deviation: deviated,
      zones: zoneAlerts,
      anomaly: {
        score: anomaly.anomaly_score,
        is_anomaly: anomaly.is_anomaly
      },
      safety_score,
      safety_level
    });
  } catch (e) {
    console.error("/location error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = app;
