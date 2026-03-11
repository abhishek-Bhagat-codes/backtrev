const express = require("express");
const { getRoute } = require("./route");
const { isDeviated } = require("./deviation");
const { checkZones, getZones } = require("./geofence");
const db = require("./config/db");

// turf is no longer needed in this file; geofence module handles it

const app = express();

app.use(express.json());

let routePoints = [];

// Create a new trip and store expected route in DB
app.post("/startTrip", async (req, res) => {
  try {
    const { user_id, origin, destination } = req.body;

    if (!user_id || !origin || !destination) {
      return res
        .status(400)
        .json({ error: "user_id, origin and destination are required" });
    }

    // 1) Get expected route from OSRM / OpenStreetMap
    routePoints = await getRoute(origin, destination);

    // 2) Insert into user_trips
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

        // 3) Store expected route points as JSON in routes table
        const routeStmt = db.prepare(
          `INSERT INTO routes (trip_id, expected_route) VALUES (?, ?)`
        );

        routeStmt.run(trip_id, JSON.stringify(routePoints), routeErr => {
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
            routePoints: routePoints.length,
            routePoints1: routePoints
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

// List all zones
app.get("/zones", async (req, res) => {
  try {
    const zones = await getZones();
    res.json(zones);
  } catch (e) {
    res.status(500).json({ error: "Failed to load zones" });
  }
});

// Optional: simple routing helper endpoint that just returns route for given coordinates
// Body: { origin: { lat, lng }, destination: { lat, lng } }
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

app.post("/location", async (req, res) => {
  const { user_id, trip_id, lat, lng, speed, timestamp } = req.body;

  if (!user_id || lat == null || lng == null) {
    return res
      .status(400)
      .json({ error: "user_id, lat and lng are required in body" });
  }

  const user = { lat, lng };

  // 0️⃣ Store user location history
  const locStmt = db.prepare(
    `INSERT INTO user_location_history (user_id, trip_id, latitude, longitude, speed, timestamp)
     VALUES (?, ?, ?, ?, ?, ?)`
  );

  locStmt.run(
    user_id,
    trip_id || null,
    lat,
    lng,
    speed || null,
    timestamp || new Date().toISOString(),
    err => {
      if (err) {
        console.error("Error saving location history:", err.message);
      }
    }
  );

  // 1️⃣ Load expected route for this trip (if trip_id provided)
  let routeForDeviation = routePoints;

  if (trip_id) {
    try {
      await new Promise((resolve, reject) => {
        db.get(
          "SELECT expected_route FROM routes WHERE trip_id = ?",
          [trip_id],
          (err, row) => {
            if (err) {
              console.error("Error loading expected route:", err.message);
              return reject(err);
            }
            if (row && row.expected_route) {
              try {
                routeForDeviation = JSON.parse(row.expected_route);
              } catch (parseErr) {
                console.error("Error parsing expected_route JSON:", parseErr);
              }
            }
            resolve();
          }
        );
      });
    } catch (e) {
      // keep fallback routePoints if DB load fails
    }
  }

  // 2️⃣ Check route deviation
  const deviated =
    Array.isArray(routeForDeviation) && routeForDeviation.length > 0
      ? isDeviated(user, routeForDeviation)
      : false;

  if (deviated) {
    console.log("⚠️ TRIP DEVIATION DETECTED");
  } else {
    console.log("User on route");
  }

  // 3️⃣ Check geofence zones
  const zoneAlerts = await checkZones({ lat, lng });

  zoneAlerts.forEach(a => {
    console.log(`📍 ${a.status} ${a.zone} (${Math.round(a.distance)}m)`);
  });

  res.json({
    deviation: deviated,
    zones: zoneAlerts
  });
});

app.listen(3000, () => {
  console.log("Server running 3000");
});