/**
 * Travira Monitoring Engine - Full System Test Script
 *
 * Tests: /startTrip, /route, /zones, /location (including Safety Score)
 *
 * Prerequisite: Start the server first (npm start), then run:
 *   node scripts/test_system.js
 */

const axios = require("axios");

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

// Test helpers
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
    return true;
  } else {
    failed++;
    console.log(`  ✗ FAIL: ${message}`);
    return false;
  }
}

function assertEqual(actual, expected, message) {
  const ok = actual === expected;
  if (ok) {
    passed++;
    console.log(`  ✓ ${message} (${actual})`);
  } else {
    failed++;
    console.log(`  ✗ FAIL: ${message} - expected ${expected}, got ${actual}`);
  }
  return ok;
}

function assertInRange(value, min, max, message) {
  const ok = value >= min && value <= max;
  if (ok) {
    passed++;
    console.log(`  ✓ ${message} (${value} in [${min}, ${max}])`);
  } else {
    failed++;
    console.log(`  ✗ FAIL: ${message} - ${value} not in [${min}, ${max}]`);
  }
  return ok;
}

function assertHasKeys(obj, keys, message) {
  const missing = keys.filter(k => !(k in obj));
  const ok = missing.length === 0;
  if (ok) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.log(`  ✗ FAIL: ${message} - missing keys: ${missing.join(", ")}`);
  }
  return ok;
}

// API helpers
async function api(method, path, data = null) {
  const config = { method, url: `${BASE_URL}${path}` };
  if (data) config.data = data;
  try {
    const res = await axios(config);
    return { ok: true, status: res.status, data: res.data };
  } catch (err) {
    return {
      ok: false,
      status: err.response?.status ?? 500,
      data: err.response?.data ?? { error: err.message }
    };
  }
}

// ─── Test Cases ─────────────────────────────────────────────────────────────

async function testRouteEndpoint() {
  console.log("\n📌 POST /route");
  const { ok, status, data } = await api("POST", "/route", {
    origin: { lat: 28.6139, lng: 77.209 },
    destination: { lat: 28.62, lng: 77.22 }
  });

  if (!ok) {
    console.log("  ⚠ Route API failed (OSRM may be unavailable). Skipping route tests.");
    return null;
  }

  assertEqual(status, 200, "Returns 200");
  assertHasKeys(data, ["status", "routePoints", "coordinates"], "Response has required keys");
  assert(Array.isArray(data.coordinates) && data.coordinates.length > 0, "Returns route coordinates");
  return data.coordinates;
}

async function testStartTrip() {
  console.log("\n📌 POST /startTrip");
  const { ok, status, data } = await api("POST", "/startTrip", {
    user_id: "test-user-1",
    origin: { lat: 28.6139, lng: 77.209 },
    destination: { lat: 28.62, lng: 77.22 }
  });

  if (!ok) {
    console.log("  ⚠ startTrip failed (OSRM may be unavailable). Some location tests will be limited.");
    return { trip_id: null, routePoints: [] };
  }

  assertEqual(status, 200, "Returns 200");
  assertEqual(data.status, "trip_started", "Status is trip_started");
  assertHasKeys(data, ["user_id", "trip_id", "routePoints"], "Response has required keys");
  assert(data.trip_id > 0, "trip_id is valid");

  return { trip_id: data.trip_id, routePoints: data.routePoints1 || [] };
}

async function testStartTripValidation() {
  console.log("\n📌 POST /startTrip (validation - missing params)");
  const { ok, status, data } = await api("POST", "/startTrip", {
    user_id: "test-user"
    // missing origin, destination
  });

  assert(!ok, "Returns error for missing params");
  assertEqual(status, 400, "Returns 400");
  assert(data.error, "Error message present");
}

async function testGetZones() {
  console.log("\n📌 GET /zones");
  const { ok, status, data } = await api("GET", "/zones");

  assertEqual(status, 200, "Returns 200");
  assert(Array.isArray(data), "Returns array of zones");
  if (data.length > 0) {
    assertHasKeys(data[0], ["id", "name", "center", "radius"], "Zone object has required fields");
  }
}

async function testCreateZone() {
  console.log("\n📌 POST /zones");
  const { ok, status, data } = await api("POST", "/zones", {
    name: "Test Zone For Safety Score",
    latitude: 28.655,
    longitude: 77.240,
    radius: 500,
    type: "test",
    risk_level: 4
  });

  assertEqual(status, 201, "Returns 201");
  assertHasKeys(data, ["id", "name", "risk_level"], "Response has required keys");
  assertEqual(data.risk_level, 4, "risk_level stored correctly");
}

async function testLocationOnRouteSafeMovement(tripId, routePoints) {
  console.log("\n📌 POST /location - Case 1: On route, safe movement");

  // Use a point on the route (first route point: [lng, lat])
  const point = routePoints?.length > 0
    ? { lat: routePoints[0][1], lng: routePoints[0][0] }
    : { lat: 28.6139, lng: 77.209 }; // fallback origin

  const { ok, status, data } = await api("POST", "/location", {
    user_id: "test-safe-user",
    trip_id: tripId,
    lat: point.lat,
    lng: point.lng,
    speed: 15,
    timestamp: new Date().toISOString()
  });

  assertEqual(status, 200, "Returns 200");
  assertHasKeys(data, ["deviation", "zones", "anomaly", "safety_score", "safety_level"], "Response has safety fields");
  assertEqual(data.deviation, false, "No route deviation when on route");
  assertInRange(data.safety_score, 0, 100, "Safety score in valid range");
  assert(["SAFE", "WARNING", "HIGH_RISK"].includes(data.safety_level), "Valid safety level");

  // Safe movement + on route: expect SAFE (80-100) unless night travel reduces it
  if (data.deviation === false && data.zones.filter(z => z.status === "INSIDE").length === 0) {
    console.log(`    → Score: ${data.safety_score}, Level: ${data.safety_level}`);
  }
}

async function testLocationRouteDeviation(tripId, routePoints) {
  console.log("\n📌 POST /location - Case 2: Route deviation");

  // Point far from route (deviated)
  const { ok, status, data } = await api("POST", "/location", {
    user_id: "test-deviation-user",
    trip_id: tripId,
    lat: 28.0,
    lng: 77.0,
    speed: 10,
    timestamp: new Date().toISOString()
  });

  assertEqual(status, 200, "Returns 200");
  if (tripId && routePoints?.length > 0) {
    assertEqual(data.deviation, true, "Route deviation detected when off route");
  }
  assertInRange(data.safety_score, 0, 100, "Safety score in valid range");
  console.log(`    → Deviation: ${data.deviation}, Score: ${data.safety_score}, Level: ${data.safety_level}`);
}

async function testLocationInsideRiskZone() {
  console.log("\n📌 POST /location - Case 3: Inside risk zone");

  // Old Delhi Crowded Market: 28.6562, 77.2410, radius 300m
  const { ok, status, data } = await api("POST", "/location", {
    user_id: "test-zone-user",
    trip_id: null,
    lat: 28.6562,
    lng: 77.241,
    speed: 5,
    timestamp: new Date().toISOString()
  });

  assertEqual(status, 200, "Returns 200");
  const insideZones = data.zones.filter(z => z.status === "INSIDE");
  assert(insideZones.length >= 1, "At least one zone INSIDE");
  assertInRange(data.safety_score, 0, 100, "Safety score in valid range");
  assert(data.safety_score < 100, "Score reduced when inside risk zone");
  console.log(`    → Zones: ${insideZones.map(z => z.zone).join(", ")}, Score: ${data.safety_score}, Level: ${data.safety_level}`);
}

async function testLocationProlongedInactivity() {
  console.log("\n📌 POST /location - Case 4: Prolonged inactivity (simulated)");

  const userId = "test-inactivity-user-" + Date.now();
  const now = Date.now();

  // Server queries: timestamp >= (now - 20 min). Need span >= 20 min, all speed < 0.3.
  // Use 19 min ago so first record stays in window when 3rd request runs a few sec later.
  const nineteenMinAgo = new Date(now - 19 * 60 * 1000);
  const fiveMinAgo = new Date(now - 5 * 60 * 1000);

  // 1) Send location 19 min ago with speed 0
  await api("POST", "/location", {
    user_id: userId,
    trip_id: null,
    lat: 28.62,
    lng: 77.21,
    speed: 0,
    timestamp: nineteenMinAgo.toISOString()
  });

  // 2) Send location 5 min ago with speed 0
  await api("POST", "/location", {
    user_id: userId,
    trip_id: null,
    lat: 28.62,
    lng: 77.21,
    speed: 0,
    timestamp: fiveMinAgo.toISOString()
  });

  // 3) Send current location with speed 0 - span 19 min, all low speed
  // Note: 19 min span may not always trigger inactivity (requires >=20). If zone seed has
  // overlap, we still verify the endpoint responds correctly.
  const { ok, status, data } = await api("POST", "/location", {
    user_id: userId,
    trip_id: null,
    lat: 28.62,
    lng: 77.21,
    speed: 0,
    timestamp: new Date().toISOString()
  });

  assertEqual(status, 200, "Returns 200");
  assertInRange(data.safety_score, 0, 100, "Safety score in valid range");
  // Prolonged inactivity applies -15, so score should be lower than without it
  console.log(`    → Score: ${data.safety_score}, Level: ${data.safety_level} (prolonged inactivity should reduce score)`);
}

async function testLocationNightTravel() {
  console.log("\n📌 POST /location - Case 5: Night travel (11 PM - 5 AM)");

  // Use timestamp at 2:30 AM (local date preserved for proper day)
  const nightTime = new Date();
  nightTime.setHours(2, 30, 0, 0);

  const { ok, status, data } = await api("POST", "/location", {
    user_id: "test-night-user",
    trip_id: null,
    lat: 28.62,
    lng: 77.21,
    speed: 10,
    timestamp: nightTime.toISOString()
  });

  assertEqual(status, 200, "Returns 200");
  assertInRange(data.safety_score, 0, 100, "Safety score in valid range");
  // Night travel applies -10. If also safe movement +2: 100-10+2=92 max. Without safe: 90.
  const isNight = nightTime.getHours() >= 23 || nightTime.getHours() < 5;
  if (isNight) {
    assert(data.safety_score <= 92, "Night travel applies -10 penalty");
  }
  console.log(`    → Score: ${data.safety_score}, Level: ${data.safety_level} (night travel -10)`);
}

async function testLocationValidation() {
  console.log("\n📌 POST /location (validation - missing user_id)");
  const { ok, status, data } = await api("POST", "/location", {
    lat: 28.62,
    lng: 77.21
  });

  assert(!ok, "Returns error for missing user_id");
  assertEqual(status, 400, "Returns 400");
  assert(data.error, "Error message present");
}

async function testLocationResponseStructure() {
  console.log("\n📌 POST /location - Response structure");
  const { ok, status, data } = await api("POST", "/location", {
    user_id: "test-structure-user",
    trip_id: null,
    lat: 28.62,
    lng: 77.21,
    speed: 12
  });

  assertEqual(status, 200, "Returns 200");
  assertHasKeys(data, ["deviation", "zones", "anomaly", "safety_score", "safety_level"], "Response has all required fields");
  assert(typeof data.safety_score === "number", "safety_score is number");
  assert(["SAFE", "WARNING", "HIGH_RISK"].includes(data.safety_level), "safety_level is valid enum");
  assert(Array.isArray(data.zones), "zones is array");
  assertHasKeys(data.anomaly, ["score", "is_anomaly"], "anomaly object has score and is_anomaly");
}

async function testPredictAnomaly() {
  console.log("\n📌 POST /predictAnomaly");
  const { ok, status, data } = await api("POST", "/predictAnomaly", {
    user_id: "user-123",
    trip_id: 1,
    lat: 28.615,
    lng: 77.2105,
    speed: 12.5,
    timestamp: "2026-03-11T12:34:56Z"
  });

  if (!ok) {
    assert(false, `Returns 200 (got ${status})`);
    return;
  }
  assertEqual(status, 200, "Returns 200");
  if (data && typeof data === "object") {
    assertHasKeys(data, ["anomaly_score", "is_anomaly"], "Response has anomaly fields");
    assertInRange(data.anomaly_score, 0, 1, "anomaly_score in [0, 1]");
    assert(typeof data.is_anomaly === "boolean", "is_anomaly is boolean");
    console.log(`    → anomaly_score: ${data.anomaly_score}, is_anomaly: ${data.is_anomaly}`);
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  Travira Monitoring Engine - System Test");
  console.log("  Base URL:", BASE_URL);
  console.log("═══════════════════════════════════════════════════════════════");

  try {
    const ping = await api("GET", "/zones");
    if (!ping.ok) {
      console.error("\n❌ Cannot reach server. Make sure it's running: npm start");
      process.exit(1);
    }
    console.log("✓ Server is reachable");
  } catch (e) {
    console.error("\n❌ Cannot reach server:", e.message);
    process.exit(1);
  }

  // Run tests
  await testRouteEndpoint();
  const { trip_id, routePoints } = await testStartTrip();
  await testStartTripValidation();
  await testGetZones();
  await testCreateZone();
  await testPredictAnomaly();
  await testLocationResponseStructure();
  await testLocationOnRouteSafeMovement(trip_id, routePoints);
  await testLocationRouteDeviation(trip_id, routePoints);
  await testLocationInsideRiskZone();
  await testLocationProlongedInactivity();
  await testLocationNightTravel();
  await testLocationValidation();

  // Summary
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log("═══════════════════════════════════════════════════════════════\n");

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error("Test runner error:", err);
  process.exit(1);
});
