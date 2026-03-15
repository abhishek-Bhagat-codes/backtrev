/**
 * Travira Safety Score Engine
 * Calculates real-time safety score (0-100) for tourists based on multiple factors.
 */

const INITIAL_SCORE = 100;
const MIN_SCORE = 0;
const MAX_SCORE = 100;

const PENALTY = {
  ROUTE_DEVIATION: 20,
  PROLONGED_INACTIVITY: 15,
  NIGHT_TRAVEL: 10,
  ANOMALY_FIXED: 25,
  SAFE_MOVEMENT_BONUS: 2
};

const RISK_LEVEL_MULTIPLIER = 10;
const INACTIVITY_SPEED_THRESHOLD_KMH = 0.3;
const NIGHT_START_HOUR = 23;  // 11 PM
const NIGHT_END_HOUR = 5;     // 5 AM

const LEVELS = {
  SAFE: { min: 80, max: 100, label: "SAFE" },
  WARNING: { min: 50, max: 79, label: "WARNING" },
  HIGH_RISK: { min: 0, max: 49, label: "HIGH_RISK" }
};

/**
 * Checks if the given timestamp falls within night travel hours (11 PM - 5 AM).
 * @param {string|Date} timestamp - ISO string or Date object
 * @returns {boolean}
 */
function isNightTravel(timestamp) {
  const date = timestamp ? new Date(timestamp) : new Date();
  const hour = date.getHours();
  return hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR;
}

/**
 * Determines if user qualifies for safe movement bonus.
 * User must be on route, not in risk zone, not inactive, and moving (speed >= 0.3 km/h).
 * @param {Object} userData - { speed, ... }
 * @param {boolean} deviation
 * @param {Array} zones - zone alerts where status === "INSIDE"
 * @param {boolean} inactivity
 * @returns {boolean}
 */
function isSafeMovement(userData, deviation, zones, inactivity) {
  const insideZones = zones.filter(z => z.status === "INSIDE");
  const speed = userData && userData.speed != null ? userData.speed : 0;
  return (
    !deviation &&
    insideZones.length === 0 &&
    !inactivity &&
    speed >= INACTIVITY_SPEED_THRESHOLD_KMH
  );
}

/**
 * Calculates total risk zone penalty from zones where user is INSIDE.
 * score -= risk_level * 10 per zone (summed if in multiple zones)
 * @param {Array} zones - zone alerts from checkZones
 * @returns {number}
 */
function getRiskZonePenalty(zones) {
  const insideZones = zones.filter(z => z.status === "INSIDE");
  return insideZones.reduce((sum, z) => sum + (z.risk_level || 0) * RISK_LEVEL_MULTIPLIER, 0);
}

/**
 * Maps a numeric score to a safety level.
 * @param {number} score
 * @returns {"SAFE" | "WARNING" | "HIGH_RISK"}
 */
function getSafetyLevel(score) {
  const clamped = Math.max(MIN_SCORE, Math.min(MAX_SCORE, score));
  if (clamped >= LEVELS.SAFE.min) return LEVELS.SAFE.label;
  if (clamped >= LEVELS.WARNING.min) return LEVELS.WARNING.label;
  return LEVELS.HIGH_RISK.label;
}

/**
 * Calculates the safety score based on current conditions.
 *
 * @param {Object} userData - User context: { speed, timestamp }
 * @param {boolean} deviation - Whether route deviation was detected
 * @param {Array} zones - Zone alerts from checkZones (must include risk_level for INSIDE zones)
 * @param {boolean} inactivity - Whether prolonged inactivity (>20 min at <0.3 km/h) was detected
 * @param {number} [previousScore] - Previous score from last update (default: 100)
 * @param {Object} [anomaly] - { anomaly_score: number, is_anomaly: boolean }
 * @returns {{ score: number, level: "SAFE" | "WARNING" | "HIGH_RISK" }}
 */
function calculateSafetyScore(userData, deviation, zones, inactivity, previousScore = INITIAL_SCORE, anomaly = null) {
  let score = typeof previousScore === "number" ? previousScore : INITIAL_SCORE;

  // Risk Zone: inside any risk zone
  const riskPenalty = getRiskZonePenalty(zones || []);
  score -= riskPenalty;

  // Route deviation
  if (deviation) {
    score -= PENALTY.ROUTE_DEVIATION;
  }

  // Prolonged inactivity
  if (inactivity) {
    score -= PENALTY.PROLONGED_INACTIVITY;
  }

  // Anomaly detection: scale by anomaly_score (0-1) or fixed penalty
  if (anomaly && anomaly.is_anomaly) {
    const anomalyPenalty = anomaly.anomaly_score != null
      ? anomaly.anomaly_score * 30
      : PENALTY.ANOMALY_FIXED;
    score -= Math.min(anomalyPenalty, 30);
  }

  // Night travel (11 PM - 5 AM)
  if (userData && isNightTravel(userData.timestamp)) {
    score -= PENALTY.NIGHT_TRAVEL;
  }

  // Safe movement bonus (on route, not in zone, not inactive, moving)
  if (isSafeMovement(userData || {}, deviation, zones || [], inactivity)) {
    score += PENALTY.SAFE_MOVEMENT_BONUS;
  }

  // Clamp to valid range
  score = Math.max(MIN_SCORE, Math.min(MAX_SCORE, Math.round(score)));
  const level = getSafetyLevel(score);

  return { score, level };
}

module.exports = {
  calculateSafetyScore,
  isNightTravel,
  getSafetyLevel,
  INITIAL_SCORE,
  PENALTY
};
