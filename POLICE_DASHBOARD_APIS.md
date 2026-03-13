# Police Dashboard API (Monitoring)

This document describes the API endpoints used by the **Police Dashboard** (a.k.a. Monitoring UI) in the BackTrav system. The police dashboard is designed to let authorized personnel monitor the live status of active trips, view risk indicators, and quickly respond to deviations or alerts.

> 🔐 All police dashboard endpoints are **protected** and require a valid JWT access token passed via the `Authorization: Bearer <token>` header.

---

## Base URL

Assuming the backend server is running locally:

- **Base URL:** `http://localhost:3000`

> If you are using a different host/port, replace accordingly.

---

## Authentication

All police dashboard endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <JWT_TOKEN>
```

If a token is missing or invalid, the API will return a `401 Unauthorized` response.

---

## Police Dashboard / Monitoring Endpoints

### ✅ GET `/api/monitoring/status`

Returns the current monitoring status for **all active users** (tourists) across active trips.

**Response (200)**

```json
[
  {
    "user_id": "user-123",
    "trip_id": 1,
    "location": { "lat": 28.615, "lng": 77.2105 },
    "safety_score": 85,
    "safety_level": "SAFE",
    "deviation": false
  },
  {
    "user_id": "user-456",
    "trip_id": 2,
    "location": { "lat": 28.621, "lng": 77.214 },
    "safety_score": 48,
    "safety_level": "HIGH_RISK",
    "deviation": true
  }
]
```

---

### ✅ GET `/api/monitoring/status/:user_id`

Returns the monitoring status for a **specific user**.

#### Path Parameters

- `user_id` (string) — ID of the user/tourist.

**Response (200)**

```json
{
  "user_id": "user-123",
  "trip_id": 1,
  "current_location": { "lat": 28.615, "lng": 77.2105 },
  "deviation": false,
  "risk_zones": [],
  "safety_score": 78,
  "safety_level": "WARNING"
}
```

---

## Related Admin Dashboard Endpoints (Optional)

The following endpoints power the admin dashboard, and while not strictly “police dashboard” endpoints, they are often used alongside monitoring screens.

### ✅ GET `/api/dashboard/tourists`

Returns a list of tourists (users) for the dashboard.

### ✅ GET `/api/dashboard/alerts`

Returns recent alerts for display in the dashboard.

### ✅ GET `/api/dashboard/zones`

Returns configured risk zones (geo-fencing areas).

---

## Notes / Troubleshooting

- Make sure your JWT token is generated using the same `JWT_SECRET` as the API server.
- If the monitoring endpoints are not available, verify the backend service implementation includes the `/api/monitoring` route and that it is enabled.
- For live updates, poll the `/api/monitoring/status` endpoint periodically (e.g., every 5–10 seconds) or use a real-time layer (WebSocket) if available.
