## Travira Monitoring Engine (Backend)

Node.js backend for the Travira tourist safety platform. It receives GPS updates from the mobile app, performs route deviation and geo‑fence checks using risk zones, and stores trip/location data in SQLite.

---

## Tech Stack

- Node.js + Express
- SQLite (`travira.db`) via `config/db.js`
- Turf.js for geofencing distance
- OSRM (OpenStreetMap router) for route generation

---

## Getting Started

### 1. Install dependencies

```bash
cd Monitoring_System
npm install
```

### 2. Run the server

```bash
npm start
```

Server runs at `http://localhost:3000`.

SQLite DB file `travira.db` is created automatically with tables:

- `risk_zones`
- `user_trips`
- `routes`
- `user_location_history`

---

## Core APIs

### Start a Trip

**POST** `/startTrip`

Creates a trip, generates expected route via OSRM, stores it, and returns `trip_id` and route points.

Request:

```json
{
  "user_id": "user-123",
  "origin": { "lat": 28.6139, "lng": 77.209 },
  "destination": { "lat": 28.62, "lng": 77.22 }
}
```

Response (simplified):

```json
{
  "status": "trip_started",
  "user_id": "user-123",
  "trip_id": 1,
  "routePoints": 120,
  "routePoints1": [[77.209, 28.6139], "..."]
}
```

---

### Routing Helper (no DB write)

**POST** `/route`

Returns route points between origin and destination using OSRM, without creating a trip.

Request:

```json
{
  "origin": { "lat": 28.6139, "lng": 77.209 },
  "destination": { "lat": 28.62, "lng": 77.22 }
}
```

Response:

```json
{
  "status": "route_generated",
  "routePoints": 120,
  "coordinates": [[77.209, 28.6139], "..."]
}
```

---

### Location Updates (Deviation + Geofencing)

**POST** `/location`

Called frequently by the mobile app to:

- Save user location to `user_location_history`
- Check route deviation (using `trip_id` expected route)
- Check risk zones (geofencing)

Request:

```json
{
  "user_id": "user-123",
  "trip_id": 1,
  "lat": 28.615,
  "lng": 77.2105,
  "speed": 12.5,
  "timestamp": "2026-03-11T12:34:56Z"
}
```

Response:

```json
{
  "deviation": false,
  "zones": [
    { "zone": "Old Delhi Crowded Market", "status": "INSIDE", "distance": 84.3 }
  ],
  "anomaly": { "score": 0.35, "is_anomaly": false },
  "safety_score": 92,
  "safety_level": "SAFE"
}
```

---

### Risk Zone Management

#### Create Zone

**POST** `/zones`

```json
{
  "name": "Old Delhi Crowded Market",
  "latitude": 28.6562,
  "longitude": 77.241,
  "radius": 300,
  "type": "crime zone",
  "expiry_type": "infinite",
  "expiry_time": null,
  "risk_level": 4
}
```

Response includes created `id` and all fields.

#### List Zones

**GET** `/zones`

Returns zones as objects with:

- `id`
- `name`
- `center: [lng, lat]`
- `radius`
- `type`
- `risk_level`

---

## Frontend & Mobile Integration Notes

- Use `/startTrip` to create a trip and draw the expected route polyline from `routePoints1`.
- Store `trip_id` and send it with every `/location` call to enable deviation checks.
- Poll `/location` every 5–10 seconds during an active trip.
- Use `zones` in the `/location` response to drive safety UI (warnings, colors, alerts).
- Admin/dashboard can manage risk zones using `/zones` (POST/GET) and visualize them on a map using `center` + `radius`.

---

## Anomaly Detection (Optional)

An ML-based anomaly detection model can improve safety scoring. The model uses lat, lng, speed to detect abnormal movement.

### Python Anomaly Service

1. Install dependencies:
   ```bash
   cd anomaly_detaction_System
   pip install -r requirements.txt
   ```

2. Start the service:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

3. Set the URL (optional, default `http://localhost:8000`):
   ```bash
   ANOMALY_SERVICE_URL=http://localhost:8000 npm start
   ```

If the Python service is unavailable, the Node backend falls back to rule-based heuristics.

### Predict Anomaly API

**POST** `/predictAnomaly`

Request:

```json
{
  "user_id": "user-123",
  "trip_id": 1,
  "lat": 28.615,
  "lng": 77.2105,
  "speed": 12.5,
  "timestamp": "2026-03-11T12:34:56Z"
}
```

Response:

```json
{
  "anomaly_score": 0.82,
  "is_anomaly": true
}
```


