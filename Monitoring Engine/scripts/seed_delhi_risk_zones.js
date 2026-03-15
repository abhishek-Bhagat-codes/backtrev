const db = require("../config/db");

// Some example risk zones in Delhi (coords are approximate)
const zones = [
  {
    name: "Old Delhi Crowded Market",
    latitude: 28.6562,
    longitude: 77.2410,
    radius: 300,
    type: "crime zone",
    expiry_type: "infinite",
    expiry_time: null,
    risk_level: 4
  },
  {
    name: "Railway Station Area",
    latitude: 28.6430,
    longitude: 77.2194,
    radius: 250,
    type: "theft hotspot",
    expiry_type: "infinite",
    expiry_time: null,
    risk_level: 3
  },
  {
    name: "Isolated Yamuna Stretch",
    latitude: 28.6265,
    longitude: 77.2550,
    radius: 400,
    type: "isolated area",
    expiry_type: "infinite",
    expiry_time: null,
    risk_level: 5
  },
  {
    name: "Construction / Hazard Zone",
    latitude: 28.5500,
    longitude: 77.2500,
    radius: 200,
    type: "disaster zone",
    expiry_type: "finite",
    expiry_time: "2026-12-31T23:59:59Z",
    risk_level: 3
  }
];

function seedZones() {
  const stmt = db.prepare(
    `INSERT INTO risk_zones (name, latitude, longitude, radius, type, expiry_type, expiry_time, risk_level)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  db.serialize(() => {
    zones.forEach(z => {
      stmt.run(
        z.name,
        z.latitude,
        z.longitude,
        z.radius,
        z.type,
        z.expiry_type,
        z.expiry_time,
        z.risk_level,
        err => {
          if (err) {
            console.error("Error inserting zone:", err.message);
          } else {
            console.log("Inserted zone:", z.name);
          }
        }
      );
    });
  });

  stmt.finalize(err => {
    if (err) {
      console.error("Finalize error:", err.message);
    }
    db.close(() => {
      console.log("Seeding complete, DB connection closed.");
    });
  });
}

seedZones();


