const turf = require("@turf/turf");
const db = require("./config/db");

// keep track of alerts locally; zones are stored in DB
let zonesCache = [];

const alertedZones = new Set();

// Load zones from DB into a local cache for fast distance checks
function loadZonesFromDb() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM risk_zones", [], (err, rows) => {
      if (err) {
        console.error("Error loading zones from DB:", err.message);
        return reject(err);
      }

      zonesCache = rows.map(row => ({
        id: row.id,
        name: row.name,
        center: [row.longitude, row.latitude],
        radius: row.radius,
        type: row.type,
        risk_level: row.risk_level
      }));

      resolve(zonesCache);
    });
  });
}

async function getZones() {
  // For now always reload; can be optimized with caching strategy
  await loadZonesFromDb();
  return zonesCache;
}

async function checkZones(user) {
  const userPoint = turf.point([user.lng, user.lat]);
  const alerts = [];

  const zones = await getZones();

  zones.forEach(zone => {
    const center = turf.point(zone.center);
    const distance =
      turf.distance(userPoint, center, { units: "kilometers" }) * 1000;

    if (distance <= zone.radius) {
      if (!alertedZones.has(zone.id)) {
        console.log(`🚨 ENTERED ${zone.name}`);
        alertedZones.add(zone.id);
      }

      alerts.push({
        zone: zone.name,
        status: "INSIDE",
        distance
      });
    } else if (distance <= zone.radius + 100) {
      alerts.push({
        zone: zone.name,
        status: "APPROACHING",
        distance
      });
    }
  });

  return alerts;
}

module.exports = { checkZones, getZones, alertedZones };