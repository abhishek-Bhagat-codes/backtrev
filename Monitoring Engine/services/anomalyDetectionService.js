/**
 * Travira Anomaly Detection Service
 *
 * Integrates the Isolation Forest model (Python) to detect abnormal movement.
 * Model input: lat, lng, speed (km/h). Output: 1=normal, -1=abnormal.
 *
 * Falls back to rule-based heuristics when the Python service is unavailable.
 */

const axios = require("axios");

const ANOMALY_SERVICE_URL =
  process.env.ANOMALY_SERVICE_URL || "http://localhost:8000";
const REQUEST_TIMEOUT_MS = 2000; // Keep low for real-time /location updates
const EXTREME_SPEED_KMH = 120; // Rule-based: speed > this = likely anomaly

let _lastErrorAt = 0;
const ERROR_COOLDOWN_MS = 30000; // Log connection errors at most every 30s

/**
 * Builds feature object from location and context for anomaly detection.
 *
 * @param {Object} params
 * @param {number} params.lat
 * @param {number} params.lng
 * @param {number} [params.speed]
 * @param {string} [params.timestamp]
 * @param {number} [params.distance_from_expected_route] - meters
 * @param {number} [params.distance_to_risk_zone] - meters (min, or 0 if inside)
 * @param {number} [params.time_of_day] - hour 0-23
 * @param {number} [params.trip_progress] - 0-1
 * @returns {Object}
 */
function buildFeatures(params) {
  const ts = params.timestamp ? new Date(params.timestamp) : new Date();
  return {
    latitude: params.lat,
    longitude: params.lng,
    speed: params.speed != null ? params.speed : 0,
    distance_from_expected_route: params.distance_from_expected_route ?? null,
    distance_to_risk_zone: params.distance_to_risk_zone ?? null,
    time_of_day: params.time_of_day ?? ts.getHours(),
    trip_progress: params.trip_progress ?? null
  };
}

/**
 * Rule-based fallback when Python ML service is unavailable.
 * Uses simple heuristics: extreme speed, etc.
 */
function ruleBasedAnomaly(features) {
  const speed = features.speed ?? 0;
  let anomaly_score = 0;

  // Extreme speed (>120 km/h for a tourist on foot/bike)
  if (speed > EXTREME_SPEED_KMH) {
    anomaly_score = Math.min(0.95, 0.5 + (speed - EXTREME_SPEED_KMH) / 200);
  }

  // Far from route + very low speed could indicate stopped in wrong place
  const distFromRoute = features.distance_from_expected_route;
  if (distFromRoute != null && distFromRoute > 2000 && speed < 0.5) {
    anomaly_score = Math.max(anomaly_score, 0.4);
  }

  const is_anomaly = anomaly_score >= 0.5;
  return {
    anomaly_score: Math.round(anomaly_score * 100) / 100,
    is_anomaly
  };
}

/**
 * Calls the Python anomaly service to get ML-based prediction.
 * @param {number} lat
 * @param {number} lng
 * @param {number} speed - km/h
 * @returns {Promise<{ anomaly_score: number, is_anomaly: boolean } | null>}
 */
async function callPythonModel(lat, lng, speed) {
  try {
    const res = await axios.post(
      `${ANOMALY_SERVICE_URL}/predict`,
      { lat, lng, speed: speed ?? 0 },
      { timeout: REQUEST_TIMEOUT_MS }
    );
    return {
      anomaly_score: res.data.anomaly_score,
      is_anomaly: res.data.is_anomaly
    };
  } catch (err) {
    const now = Date.now();
    if (now - _lastErrorAt > ERROR_COOLDOWN_MS) {
      _lastErrorAt = now;
      console.warn(
        "[AnomalyDetection] Python service unavailable, using fallback:",
        err.message
      );
    }
    return null;
  }
}

/**
 * Predicts if the current movement is anomalous.
 *
 * @param {Object} features - From buildFeatures():
 *   { latitude, longitude, speed, distance_from_expected_route, distance_to_risk_zone, time_of_day, trip_progress }
 * @returns {Promise<{ anomaly_score: number, is_anomaly: boolean }>}
 */
async function predictMovementAnomaly(features) {
  const lat = features.latitude ?? features.lat;
  const lng = features.longitude ?? features.lng;
  const speed = features.speed ?? 0;

  if (lat == null || lng == null) {
    return { anomaly_score: 0, is_anomaly: false };
  }

  const mlResult = await callPythonModel(lat, lng, speed);
  if (mlResult) return mlResult;

  return ruleBasedAnomaly({
    ...features,
    lat,
    lng,
    speed
  });
}

module.exports = {
  predictMovementAnomaly,
  buildFeatures,
  ruleBasedAnomaly,
  ANOMALY_SERVICE_URL
};
