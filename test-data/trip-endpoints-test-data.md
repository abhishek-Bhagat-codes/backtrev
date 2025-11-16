# Trip Endpoints Test Data

## Base URL
```
http://localhost:3000/api/trips
```

## Authentication
All endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. SAVE TRIP (POST /api/trips)

### Request
```http
POST /api/trips
Content-Type: application/json
Authorization: Bearer <your_jwt_token>
```

### Request Body Examples

#### Example 1: Basic Trip
```json
{
  "tripName": "Summer Vacation to Goa",
  "startingLocation": "Mumbai, Maharashtra",
  "endingLocation": "Goa",
  "startingDandT": "2024-06-15T09:00:00Z",
  "endingDandT": "2024-06-20T18:00:00Z",
  "intermediateStops": "Pune, Kolhapur",
  "transportation": "Flight",
  "hotelName": "Taj Exotica Resort",
  "emergencyContact": "+919876543210",
  "contactName": "John Doe"
}
```

#### Example 2: Road Trip
```json
{
  "tripName": "Delhi to Manali Road Trip",
  "startingLocation": "New Delhi",
  "endingLocation": "Manali, Himachal Pradesh",
  "startingDandT": "2024-07-01T06:00:00Z",
  "endingDandT": "2024-07-05T20:00:00Z",
  "intermediateStops": "Chandigarh, Kullu",
  "transportation": "Car",
  "hotelName": "Hotel Snow Valley",
  "emergencyContact": "+919123456789",
  "contactName": "Jane Smith"
}
```

#### Example 3: Business Trip
```json
{
  "tripName": "Business Conference - Bangalore",
  "startingLocation": "Hyderabad, Telangana",
  "endingLocation": "Bangalore, Karnataka",
  "startingDandT": "2024-08-10T08:00:00Z",
  "endingDandT": "2024-08-12T19:00:00Z",
  "intermediateStops": "",
  "transportation": "Train",
  "hotelName": "ITC Gardenia"
}
```

#### Example 4: Minimal Data
```json
{
  "tripName": "Weekend Getaway",
  "startingLocation": "Chennai",
  "endingLocation": "Pondicherry",
  "emergencyContact": "+919855443322",
  "contactName": "Sarah Williams"
}
```

### Expected Response (201 Created)
```json
{
  "message": "Trip saved successfully",
  "trip": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "tripName": "Summer Vacation to Goa",
    "startingLocation": "Mumbai, Maharashtra",
    "endingLocation": "Goa",
    "startingDandT": "2024-06-15T09:00:00.000Z",
    "endingDandT": "2024-06-20T18:00:00.000Z",
    "intermediateStops": "Pune, Kolhapur",
    "transportation": "Flight",
    "hotelName": "Taj Exotica Resort",
    "emergencyContact": "+919876543210",
    "contactName": "John Doe",
    "createdAt": "2024-05-20T10:30:00.000Z"
  }
}
```

---

## 2. UPDATE TRIP (PUT /api/trips/:tripId)

### Request
```http
PUT /api/trips/507f1f77bcf86cd799439011
Content-Type: application/json
Authorization: Bearer <your_jwt_token>
```

### Request Body Examples

#### Example 1: Update All Fields
```json
{
  "tripName": "Extended Summer Vacation to Goa",
  "startingLocation": "Mumbai, Maharashtra",
  "endingLocation": "Goa",
  "startingDandT": "2024-06-15T09:00:00Z",
  "endingDandT": "2024-06-25T18:00:00Z",
  "intermediateStops": "Pune, Kolhapur, Ratnagiri",
  "transportation": "Flight",
  "hotelName": "Taj Exotica Resort & Spa",
  "emergencyContact": "+919876543210",
  "contactName": "John Doe"
}
```

#### Example 2: Partial Update
```json
{
  "tripName": "Summer Vacation to Goa - Updated",
  "endingDandT": "2024-06-22T18:00:00Z",
  "hotelName": "Grand Hyatt Goa"
}
```

#### Example 3: Change Transportation
```json
{
  "transportation": "Train",
  "intermediateStops": "Pune, Satara, Kolhapur"
}
```

### Expected Response (200 OK)
```json
{
  "message": "Trip updated successfully",
  "trip": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "tripName": "Extended Summer Vacation to Goa",
    "startingLocation": "Mumbai, Maharashtra",
    "endingLocation": "Goa",
    "startingDandT": "2024-06-15T09:00:00.000Z",
    "endingDandT": "2024-06-25T18:00:00.000Z",
    "intermediateStops": "Pune, Kolhapur, Ratnagiri",
    "transportation": "Flight",
    "hotelName": "Taj Exotica Resort & Spa",
    "emergencyContact": "+919876543210",
    "contactName": "John Doe",
    "createdAt": "2024-05-20T10:30:00.000Z"
  }
}
```

### Error Response (404 Not Found)
```json
{
  "message": "Trip not found"
}
```

---

## 3. FETCH ALL TRIPS (GET /api/trips)

### Request
```http
GET /api/trips
Authorization: Bearer <your_jwt_token>
```

### Expected Response (200 OK)
```json
{
  "trips": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f191e810c19729de860ea",
      "tripName": "Summer Vacation to Goa",
      "startingLocation": "Mumbai, Maharashtra",
      "endingLocation": "Goa",
      "startingDandT": "2024-06-15T09:00:00.000Z",
      "endingDandT": "2024-06-20T18:00:00.000Z",
      "intermediateStops": "Pune, Kolhapur",
      "transportation": "Flight",
      "hotelName": "Taj Exotica Resort",
      "emergencyContact": "+919876543210",
      "contactName": "John Doe",
      "createdAt": "2024-05-20T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f191e810c19729de860ea",
      "tripName": "Delhi to Manali Road Trip",
      "startingLocation": "New Delhi",
      "endingLocation": "Manali, Himachal Pradesh",
      "startingDandT": "2024-07-01T06:00:00.000Z",
      "endingDandT": "2024-07-05T20:00:00.000Z",
      "intermediateStops": "Chandigarh, Kullu",
      "transportation": "Car",
      "hotelName": "Hotel Snow Valley",
      "emergencyContact": "+919123456789",
      "contactName": "Jane Smith",
      "createdAt": "2024-05-18T14:20:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "userId": "507f191e810c19729de860ea",
      "tripName": "Business Conference - Bangalore",
      "startingLocation": "Hyderabad, Telangana",
      "endingLocation": "Bangalore, Karnataka",
      "startingDandT": "2024-08-10T08:00:00.000Z",
      "endingDandT": "2024-08-12T19:00:00.000Z",
      "intermediateStops": "",
      "transportation": "Train",
      "hotelName": "ITC Gardenia",
      "emergencyContact": "+919988776655",
      "contactName": "Robert Johnson",
      "createdAt": "2024-05-15T09:10:00.000Z"
    }
  ]
}
```

### Empty Response (200 OK)
```json
{
  "trips": []
}
```

---

## 4. FETCH SINGLE TRIP (GET /api/trips/:tripId)

### Request
```http
GET /api/trips/507f1f77bcf86cd799439011
Authorization: Bearer <your_jwt_token>
```

### Expected Response (200 OK)
```json
{
  "trip": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "tripName": "Summer Vacation to Goa",
    "startingLocation": "Mumbai, Maharashtra",
    "endingLocation": "Goa",
    "startingDandT": "2024-06-15T09:00:00.000Z",
    "endingDandT": "2024-06-20T18:00:00.000Z",
    "intermediateStops": "Pune, Kolhapur",
    "transportation": "Flight",
    "hotelName": "Taj Exotica Resort",
    "emergencyContact": "+919876543210",
    "contactName": "John Doe",
    "createdAt": "2024-05-20T10:30:00.000Z"
  }
}
```

### Error Response (404 Not Found)
```json
{
  "message": "Trip not found"
}
```

---

## Testing with cURL

### 1. Save Trip
```bash
curl -X POST http://localhost:3000/api/trips \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "tripName": "Summer Vacation to Goa",
    "startingLocation": "Mumbai, Maharashtra",
    "endingLocation": "Goa",
    "startingDandT": "2024-06-15T09:00:00Z",
    "endingDandT": "2024-06-20T18:00:00Z",
    "intermediateStops": "Pune, Kolhapur",
    "transportation": "Flight",
    "hotelName": "Taj Exotica Resort"
  }'
```

### 2. Update Trip
```bash
curl -X PUT http://localhost:3000/api/trips/TRIP_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "tripName": "Extended Summer Vacation to Goa",
    "endingDandT": "2024-06-25T18:00:00Z"
  }'
```

### 3. Fetch All Trips
```bash
curl -X GET http://localhost:3000/api/trips \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Fetch Single Trip
```bash
curl -X GET http://localhost:3000/api/trips/TRIP_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Testing with Postman/Thunder Client

### Collection Setup:
1. **Base URL**: `http://localhost:3000/api/trips`
2. **Authorization**: Bearer Token (set in collection/auth)
3. **Headers**: `Content-Type: application/json` (for POST/PUT)

### Quick Test Sequence:
1. First, login to get JWT token: `POST /api/users/login`
2. Save a trip: `POST /api/trips` (use Example 1 body)
3. Fetch all trips: `GET /api/trips` (note the `_id` from response)
4. Fetch single trip: `GET /api/trips/{tripId}` (use `_id` from step 3)
5. Update trip: `PUT /api/trips/{tripId}` (use `_id` from step 3)

---

## Date Format Notes
- Use ISO 8601 format: `YYYY-MM-DDTHH:mm:ssZ`
- Examples:
  - `2024-06-15T09:00:00Z` (UTC)
  - `2024-06-15T09:00:00+05:30` (IST - Indian Standard Time)
  - `2024-06-15T14:30:00Z` (equivalent to 8:00 PM IST)

