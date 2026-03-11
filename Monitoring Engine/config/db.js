const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// Use a local SQLite file in the project root
const DB_PATH = path.join(__dirname, "..", "travira.db");

const db = new sqlite3.Database(DB_PATH, err => {
  if (err) {
    console.error("Failed to connect to SQLite DB:", err.message);
  } else {
    console.log("SQLite DB connected at", DB_PATH);
  }
});

// Initialize tables if they do not exist (based on project plan)
db.serialize(() => {
  // 1. Risk Zone Table
  db.run(
    `CREATE TABLE IF NOT EXISTS risk_zones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      radius REAL NOT NULL,
      type TEXT,
      created_time TEXT DEFAULT CURRENT_TIMESTAMP,
      expiry_type TEXT,
      expiry_time TEXT,
      risk_level INTEGER
    )`
  );

  // 2. User Trips Table
  db.run(
    `CREATE TABLE IF NOT EXISTS user_trips (
      trip_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      origin_lat REAL NOT NULL,
      origin_lon REAL NOT NULL,
      destination_lat REAL NOT NULL,
      destination_lon REAL NOT NULL,
      start_time TEXT DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'active'
    )`
  );

  // 3. Routes Table
  db.run(
    `CREATE TABLE IF NOT EXISTS routes (
      route_id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      expected_route TEXT NOT NULL, -- JSON array of coordinates
      actual_route TEXT,            -- JSON array of coordinates
      FOREIGN KEY (trip_id) REFERENCES user_trips(trip_id)
    )`
  );

  // 4. User Location History
  db.run(
    `CREATE TABLE IF NOT EXISTS user_location_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      trip_id INTEGER,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      speed REAL,
      timestamp TEXT,
      FOREIGN KEY (trip_id) REFERENCES user_trips(trip_id)
    )`
  );
});

module.exports = db;

