function haversine(lat1, lon1, lat2, lon2) {

  const R = 6371000;

  const toRad = v => v * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon/2) *
    Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

function isDeviated(user, route, threshold = 200) {
  for (let point of route) {
    const dist = haversine(user.lat, user.lng, point[1], point[0]);
    if (dist < threshold) return false;
  }
  return true;
}

/**
 * Returns minimum distance (meters) from user to any point on the route.
 * Route format: [[lng, lat], ...]
 */
function getDistanceFromRoute(user, route) {
  if (!route || route.length === 0) return null;
  let minDist = Infinity;
  for (let point of route) {
    const dist = haversine(user.lat, user.lng, point[1], point[0]);
    if (dist < minDist) minDist = dist;
  }
  return minDist;
}

module.exports = { isDeviated, getDistanceFromRoute };