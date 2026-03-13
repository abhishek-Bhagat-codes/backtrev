# Travira Monitoring Engine — API Documentation

Complete reference for all routes, sample inputs/outputs, and system behavior.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Base URL & Headers](#base-url--headers)
4. [API Endpoints](#api-endpoints)
5. [Safety Score System](#safety-score-system)
6. [Error Responses](#error-responses)
7. [Database Tables](#database-tables)
8. [Typical Workflow](#typical-workflow)

---

## Project Overview

**Travira Monitoring Engine** is a Node.js + Express backend for real-time tourist safety monitoring. It provides:

- **Trip management** — Start trips with route generation via OSRM
- **Real-time location tracking** — GPS updates with deviation & geofence checks
- **Risk zone geofencing** — Define and monitor areas (crime, hazards, etc.)
- **Safety Score** — 0–100 score based on route, zones, inactivity, night travel, anomalies
- **Anomaly detection** — ML-based (optional) or rule-based movement anomaly prediction

**Tech stack:** Node.js, Express, SQLite, Turf.js, OSRM, Isolation Forest (Python)

---

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm

### Install & Run

```bash
npm install
npm start
```

Server runs at **http://localhost:3000** (or `PORT` env var).

### Optional: Anomaly Detection (Python)

For ML-based anomaly detection:

```bash
cd anomaly_detaction_System
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## Base URL & Headers

| Property | Value |
|----------|-------|
| Base URL | `http://localhost:3000` |
| Content-Type | `application/json` |
| Accept | `application/json` |

All request bodies must be JSON.

---

## API Endpoints

### 1. Start a Trip

**POST** `/startTrip`

Creates a new trip, fetches the expected route from OSRM, and stores it in the database. Use the returned `trip_id` for all `/location` calls during the trip.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| user_id | string | Yes | Unique user identifier |
| origin | object | Yes | `{ lat: number, lng: number }` |
| destination | object | Yes | `{ lat: number, lng: number }` |

#### Sample Request

```json
{
  "user_id": "user-123",
  "origin": { "lat": 28.6139, "lng": 77.209 },
  "destination": { "lat": 28.62, "lng": 77.22 }
}
```

#### Success Response (200)

```json
{
  "status": "trip_started",
  "user_id": "user-123",
  "trip_id": 1,
  "routePoints": 120,
  "routePoints1": [
    [77.209, 28.6139],
    [77.2095, 28.614],
    [77.21, 28.6145]
  ]
}
```

| Field | Description |
|-------|-------------|
| status | Always `"trip_started"` |
| trip_id | Use this in `/location` for deviation checks |
| routePoints | Number of route coordinates |
| routePoints1 | Array of `[lng, lat]` points for map polyline |

#### Error Response (400)

```json
{
  "error": "user_id, origin and destination are required"
}
```

---

### 2. Generate Route (No DB Write)

**POST** `/route`

Returns route coordinates between two points using OSRM. Does **not** create a trip or store anything in the database. Useful for previewing routes before starting a trip.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| origin | object | Yes | `{ lat: number, lng: number }` |
| destination | object | Yes | `{ lat: number, lng: number }` |

#### Sample Request

```json
{
  "origin": { "lat": 28.6139, "lng": 77.209 },
  "destination": { "lat": 28.62, "lng": 77.22 }
}
```

#### Success Response (200)

```json
{
  "status": "route_generated",
  "routePoints": 120,
  "coordinates": [
    [77.209, 28.6139],
    [77.2095, 28.614],
    [77.21, 28.6145]
  ]
}
```

#### Error Response (400)

```json
{
  "error": "origin and destination are required"
}
```

---

### 3. Location Update (Real-Time Monitoring)

**POST** `/location`

**Core endpoint for real-time monitoring.** Call every 5–10 seconds during an active trip. Saves location, checks deviation, risk zones, prolonged inactivity, runs anomaly detection, and returns safety score.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| user_id | string | Yes | User identifier |
| lat | number | Yes | Latitude |
| lng | number | Yes | Longitude |
| trip_id | number | No | From `/startTrip`; enables route deviation check |
| speed | number | No | Speed in km/h; used for inactivity & anomaly |
| timestamp | string | No | ISO 8601; defaults to server time |

#### Sample Request

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

#### Success Response (200)

```json
{
  "deviation": false,
  "zones": [
    {
      "zone": "Old Delhi Crowded Market",
      "status": "INSIDE",
      "distance": 84.3,
      "risk_level": 4
    }
  ],
  "anomaly": {
    "score": 0.35,
    "is_anomaly": false
  },
  "safety_score": 92,
  "safety_level": "SAFE"
}
```

| Field | Description |
|-------|-------------|
| deviation | `true` if user is >200m from expected route |
| zones | Array of risk zones (INSIDE or APPROACHING) |
| anomaly.score | 0–1; higher = more anomalous |
| anomaly.is_anomaly | `true` if movement classified as abnormal |
| safety_score | 0–100 |
| safety_level | `SAFE` \| `WARNING` \| `HIGH_RISK` |

#### Zone Status Values

| status | Meaning |
|--------|---------|
| INSIDE | User within zone radius |
| APPROACHING | User within zone radius + 100m |

#### Error Response (400)

```json
{
  "error": "user_id, lat and lng are required in body"
}
```

---

### 4. Predict Anomaly (Standalone)

**POST** `/predictAnomaly`

Returns anomaly prediction for a given location/speed without full `/location` flow. Useful for testing or lightweight checks.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| lat | number | Yes | Latitude |
| lng | number | Yes | Longitude |
| speed | number | No | Speed in km/h (default 0) |
| user_id | string | No | Ignored |
| trip_id | number | No | Ignored |
| timestamp | string | No | Ignored |

#### Sample Request

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

#### Success Response (200)

```json
{
  "anomaly_score": 0.82,
  "is_anomaly": true
}
```

| Field | Description |
|-------|-------------|
| anomaly_score | 0–1; higher = more anomalous |
| is_anomaly | `true` if prediction = abnormal |

#### Error Response (400)

```json
{
  "error": "lat and lng are required"
}
```

---

### 5. Create Risk Zone

**POST** `/zones`

Creates a new risk zone (geofence) for safety monitoring.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Zone label |
| latitude | number | Yes | Center latitude |
| longitude | number | Yes | Center longitude |
| radius | number | Yes | Radius in meters |
| type | string | No | e.g. "crime zone", "theft hotspot" |
| expiry_type | string | No | "infinite" or "finite" |
| expiry_time | string | No | ISO date if finite |
| risk_level | number | No | 1–5; used in safety score (×10 penalty) |

#### Sample Request

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

#### Success Response (201)

```json
{
  "id": 1,
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

---

### 6. List Risk Zones

**GET** `/zones`

Returns all risk zones. No request body.

#### Success Response (200)

```json
[
  {
    "id": 1,
    "name": "Old Delhi Crowded Market",
    "center": [77.241, 28.6562],
    "radius": 300,
    "type": "crime zone",
    "risk_level": 4
  }
]
```

| Field | Description |
|-------|-------------|
| center | `[longitude, latitude]` for map display |
| radius | Meters |

---

## Safety Score System

The safety score is **0–100**, calculated on every `/location` call.

### Initial Value

- **100** when a trip starts or for a new user.

### Factors That Decrease Score

| Factor | Penalty |
|--------|---------|
| Inside risk zone | `risk_level × 10` per zone |
| Route deviation | −20 |
| Prolonged inactivity (>20 min at <0.3 km/h) | −15 |
| Night travel (11 PM – 5 AM) | −10 |
| Anomaly detected | `anomaly_score × 30` (max 30) |

### Factor That Increases Score

| Factor | Bonus |
|--------|-------|
| Safe movement (on route, not in zone, not inactive, speed ≥ 0.3 km/h) | +2 (capped at 100) |

### Safety Levels

| Score | Level |
|-------|-------|
| 80 – 100 | SAFE |
| 50 – 79 | WARNING |
| 0 – 49 | HIGH_RISK |

---

## Error Responses

### 400 Bad Request

Missing or invalid parameters:

```json
{
  "error": "user_id, lat and lng are required in body"
}
```

### 500 Internal Server Error

Server or external service (e.g. OSRM) failure:

```json
{
  "error": "Internal server error"
}
```

---

## Database Tables

| Table | Purpose |
|-------|---------|
| risk_zones | Geofence definitions |
| user_trips | Trip metadata (origin, destination) |
| routes | Expected route coordinates (JSON) per trip |
| user_location_history | GPS history |
| safety_scores | Safety score history per user/trip |

---

## Typical Workflow

### 1. Admin: Create Risk Zones

```http
POST /zones
{ "name": "...", "latitude": 28.65, "longitude": 77.24, "radius": 300, "risk_level": 4 }
```

### 2. User: Start Trip

```http
POST /startTrip
{ "user_id": "user-1", "origin": {...}, "destination": {...} }
→ Save trip_id
```

### 3. App: Poll Location (every 5–10 sec)

```http
POST /location
{ "user_id": "user-1", "trip_id": 1, "lat": 28.615, "lng": 77.21, "speed": 12 }
→ Show safety_score, zones, anomaly, deviation
```

### 4. Optional: Preview Route Before Trip

```http
POST /route
{ "origin": {...}, "destination": {...} }
```

### 5. Optional: Test Anomaly Only

```http
POST /predictAnomaly
{ "lat": 28.615, "lng": 77.21, "speed": 12 }
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | HTTP server port |
| ANOMALY_SERVICE_URL | http://localhost:8000 | Python anomaly service URL |

---

*Travira Monitoring Engine — API Documentation*
