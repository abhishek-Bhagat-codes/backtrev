/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in meters

  return distance;
}

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number} radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Check if a point is within a geofence (circle)
 * @param {number} userLat - User's latitude
 * @param {number} userLon - User's longitude
 * @param {number} fenceLat - Geofence center latitude
 * @param {number} fenceLon - Geofence center longitude
 * @param {number} radius - Geofence radius in meters
 * @returns {boolean} True if user is within geofence
 */
function isWithinGeofence(userLat, userLon, fenceLat, fenceLon, radius) {
  const distance = calculateDistance(userLat, userLon, fenceLat, fenceLon);
  return distance <= radius;
}

/**
 * Calculate safety score decrease based on alert level
 * @param {string} alertLevel - 'low', 'medium', 'high', 'critical'
 * @param {number} currentScore - Current safety score
 * @returns {number} New safety score after decrease
 */
function calculateSafetyScoreDecrease(alertLevel, currentScore) {
  let decreaseAmount = 0;

  switch (alertLevel) {
    case 'low':
      decreaseAmount = 5;
      break;
    case 'medium':
      decreaseAmount = 10;
      break;
    case 'high':
      decreaseAmount = 20;
      break;
    case 'critical':
      decreaseAmount = 30;
      break;
    default:
      decreaseAmount = 10;
  }

  const newScore = Math.max(0, currentScore - decreaseAmount); // Ensure score doesn't go below 0
  return newScore;
}

module.exports = {
  calculateDistance,
  toRadians,
  isWithinGeofence,
  calculateSafetyScoreDecrease
};

