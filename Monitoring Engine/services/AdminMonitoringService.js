/**
 * Admin Monitoring Service
 *
 * Combines latest user location, route deviation detection, geofence detection,
 * and safety score into a unified monitoring object for the police admin dashboard.
 */

const db = require("../config/db");
const { isDeviated } = require("../deviation");
const { checkZones } = require("../geofence");
const { getSafetyLevel } = require("./safetyScoreEngine");

/**
 * Gets the latest location per user (optimized query for many users).
 * Uses a join for efficient "latest timestamp per user" selection.
 *
 * @param {string[]} [userIds] - Optional filter by user IDs
 * @returns {Promise<Map<string, Object>>} Map of user_id -> { latitude, longitude, trip_id, speed, timestamp }
 */
function getLatestLocationsByUser(userIds = null) {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT ulh.user_id, ulh.trip_id, ulh.latitude, ulh.longitude, ulh.speed, ulh.timestamp
      FROM user_location_history ulh
      INNER JOIN (
        SELECT user_id, MAX(timestamp) AS max_ts
        FROM user_location_history
        GROUP BY user_id
      ) latest ON ulh.user_id = latest.user_id AND ulh.timestamp = latest.max_ts
    `;
    const params = [];

    if (userIds && userIds.length > 0) {
      const placeholders = userIds.map(() => "?").join(",");
      sql += ` WHERE ulh.user_id IN (${placeholders})`;
      params.push(...userIds);
    }

    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      const map = new Map();
      (rows || []).forEach(row => {
        map.set(row.user_id, {
          latitude: row.latitude,
          longitude: row.longitude,
          trip_id: row.trip_id,
          speed: row.speed,
          timestamp: row.timestamp
        });
      });
      resolve(map);
    });
  });
}

/**
 * Gets the latest safety score per user/trip.
 *
 * @returns {Promise<Map<string, { score: number, level: string }>>} Map of "user_id:trip_id" -> { score, level }
 */
function getLatestSafetyScores() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT user_id, trip_id, score, level
      FROM safety_scores ss
      WHERE id IN (
        SELECT MAX(id) FROM safety_scores
        GROUP BY user_id, COALESCE(trip_id, -1)
      )
    `;

    // Simpler approach: get all and take latest per user/trip in JS
    const sql2 = `
      SELECT user_id, trip_id, score, level, id
      FROM safety_scores
      ORDER BY user_id, COALESCE(trip_id, -1), id DESC
    `;

    db.all(sql2, [], (err, rows) => {
      if (err) return reject(err);
      const map = new Map();
      (rows || []).forEach(row => {
        const key = `${row.user_id}:${row.trip_id != null ? row.trip_id : "null"}`;
        if (!map.has(key)) {
          map.set(key, { score: row.score, level: row.level });
        }
      });
      resolve(map);
    });
  });
}

/**
 * Gets expected route for a trip.
 * @param {number} tripId
 * @returns {Promise<Array|null>} Route points [[lng, lat], ...] or null
 */
function getExpectedRoute(tripId) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT expected_route FROM routes WHERE trip_id = ?",
      [tripId],
      (err, row) => {
        if (err) return reject(err);
        if (!row || !row.expected_route) return resolve(null);
        try {
          resolve(JSON.parse(row.expected_route));
        } catch {
          resolve(null);
        }
      }
    );
  });
}

/**
 * Checks prolonged inactivity (speed < 0.3 km/h for 20+ min).
 */
function checkProlongedInactivity(userId, tripId) {
  return new Promise((resolve, reject) => {
    const twentyMinAgo = new Date(Date.now() - 20 * 60 * 1000).toISOString();
    const params = tripId ? [userId, tripId, twentyMinAgo] : [userId, twentyMinAgo];
    const sql = tripId
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
      const allLowSpeed = rows.every(r => (r.speed != null ? r.speed : 0) < 0.3);

      resolve(spanMinutes >= 20 && allLowSpeed);
    });
  });
}

/**
 * Formats zone alerts for admin response: { name, distance }.
 */
function formatZonesForResponse(zoneAlerts) {
  return (zoneAlerts || []).map(z => ({
    name: z.zone,
    distance: Math.round((z.distance ?? 0) * 10) / 10
  }));
}

/**
 * Builds a unified monitoring object for a single user.
 *
 * @param {Object} trip - { trip_id, user_id, origin_lat, origin_lon, destination_lat, destination_lon, status }
 * @param {Object|null} location - { latitude, longitude, trip_id, speed, timestamp } or null
 * @param {Object|null} safety - { score, level } or null
 * @param {boolean} deviation
 * @param {Array} zoneAlerts - from checkZones
 * @returns {Object} Unified monitoring object
 */
function buildMonitoringObject(trip, location, safety, deviation, zoneAlerts) {
  const score = safety?.score ?? 100;
  const level = safety?.level ?? getSafetyLevel(score);

  return {
    user_id: trip.user_id,
    trip_id: trip.trip_id,
    location: location
      ? { lat: location.latitude, lng: location.longitude }
      : null,
    safety_score: score,
    safety_level: level,
    deviation: deviation ?? false,
    zones: formatZonesForResponse(zoneAlerts)
  };
}

/**
 * Gets all active trips.
 * @returns {Promise<Array>}
 */
function getActiveTrips() {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT trip_id, user_id, origin_lat, origin_lon, destination_lat, destination_lon, status
       FROM user_trips
       WHERE status = 'active'
       ORDER BY start_time DESC`,
      [],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      }
    );
  });
}

/**
 * Live monitoring: all active users with latest status.
 * Optimized for many users sending updates every 5-10 seconds.
 *
 * @returns {Promise<Array>} Array of monitoring objects
 */
async function getLiveMonitoringStatus() {
  const activeTrips = await getActiveTrips();
  if (activeTrips.length === 0) return [];

  const userIds = [...new Set(activeTrips.map(t => t.user_id))];
  const [latestLocations, latestScores] = await Promise.all([
    getLatestLocationsByUser(userIds),
    getLatestSafetyScores()
  ]);

  const results = [];

  for (const trip of activeTrips) {
    const location = latestLocations.get(trip.user_id);
    const scoreKey = `${trip.user_id}:${trip.trip_id}`;
    const scoreKeyNull = `${trip.user_id}:null`;
    const safety = latestScores.get(scoreKey) ?? latestScores.get(scoreKeyNull) ?? null;

    let deviation = false;
    let zoneAlerts = [];

    if (location) {
      const userPoint = { lat: location.latitude, lng: location.longitude };
      const route = await getExpectedRoute(trip.trip_id);
      deviation =
        Array.isArray(route) && route.length > 0
          ? isDeviated(userPoint, route)
          : false;
      zoneAlerts = await checkZones(userPoint);
    }

    const monitoring = buildMonitoringObject(
      trip,
      location,
      safety,
      deviation,
      zoneAlerts
    );
    results.push(monitoring);
  }

  return results;
}

/**
 * Single user monitoring: latest status for a specific user.
 *
 * @param {string} userId
 * @returns {Promise<Object|null>} Monitoring object or null if user not found
 */
async function getUserMonitoringStatus(userId) {
  const activeTrips = await getActiveTrips();
  const userTrip = activeTrips.find(t => t.user_id === userId);
  if (!userTrip) return null;

  const [locations, latestScores] = await Promise.all([
    getLatestLocationsByUser([userId]),
    getLatestSafetyScores()
  ]);

  const location = locations.get(userId);
  const scoreKey = `${userId}:${userTrip.trip_id}`;
  const scoreKeyNull = `${userId}:null`;
  const safety = latestScores.get(scoreKey) ?? latestScores.get(scoreKeyNull) ?? null;

  let deviation = false;
  let zoneAlerts = [];

  if (location) {
    const userPoint = { lat: location.latitude, lng: location.longitude };
    const route = await getExpectedRoute(userTrip.trip_id);
    deviation =
      Array.isArray(route) && route.length > 0
        ? isDeviated(userPoint, route)
        : false;
    zoneAlerts = await checkZones(userPoint);
  }

  const monitoring = buildMonitoringObject(
    userTrip,
    location,
    safety,
    deviation,
    zoneAlerts
  );

  return {
    user_id: monitoring.user_id,
    trip_id: monitoring.trip_id,
    current_location: monitoring.location,
    deviation: monitoring.deviation,
    risk_zones: monitoring.zones,
    safety_score: monitoring.safety_score,
    safety_level: monitoring.safety_level
  };
}

/**
 * Returns all currently active trips for admin.
 */
async function getActiveTripsForAdmin() {
  const trips = await getActiveTrips();
  return trips.map(t => ({
    trip_id: t.trip_id,
    user_id: t.user_id,
    origin: [t.origin_lat, t.origin_lon],
    destination: [t.destination_lat, t.destination_lon],
    status: t.status
  }));
}

module.exports = {
  getLiveMonitoringStatus,
  getUserMonitoringStatus,
  getActiveTripsForAdmin,
  getActiveTrips,
  getLatestLocationsByUser,
  getLatestSafetyScores
};
