# SOS Notification Endpoint Test Data

## Base URLs
```
Create SOS: http://localhost:3000/api/emergency-notifications/sos
Fetch SOS: http://localhost:3000/api/sos-notifications
```

## Authentication
All endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## CREATE SOS (POST /api/emergency-notifications/sos)

### Endpoint
```http
POST /api/emergency-notifications/sos
Content-Type: application/json
Authorization: Bearer <your_jwt_token>
```

### Request Body Examples

#### Example 1: With Coordinates
```json
{
  "latitude": 19.0760,
  "longitude": 72.8777,
  "currentLocation": "Mumbai, Maharashtra"
}
```

#### Example 2: With Coordinates Only
```json
{
  "latitude": 19.0760,
  "longitude": 72.8777
}
```

#### Example 3: Without Coordinates (Uses Current Location)
```json
{}
```

**Note**: If coordinates are not provided, the system will automatically use the user's current location from the database. If no current location exists, it will return an error.

#### Example 4: With Custom Location String
```json
{
  "latitude": 28.7041,
  "longitude": 77.1025,
  "currentLocation": "Near Connaught Place, New Delhi"
}
```

#### Example 5: With Message
```json
{
  "latitude": 19.0760,
  "longitude": 72.8777,
  "currentLocation": "Mumbai, Maharashtra",
  "message": "Need immediate help!"
}
```

---

### Expected Response (201 Created)

#### Success Response with Coordinates:
```json
{
  "message": "SOS emergency notification created successfully",
  "notification": {
    "_id": "507f1f77bcf86cd799439081",
    "userId": "507f191e810c19729de860ea",
    "fullName": "John Doe",
    "currentLocation": "Mumbai, Maharashtra",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "status": "pending",
    "message": null,
    "createdAt": "2024-05-20T15:30:00.000Z",
    "acknowledgedAt": null,
    "resolvedAt": null
  }
}
```

#### Success Response (Using Current Location):
```json
{
  "message": "SOS emergency notification created successfully",
  "notification": {
    "_id": "507f1f77bcf86cd799439082",
    "userId": "507f191e810c19729de860ea",
    "fullName": "John Doe",
    "currentLocation": "19.0380, 72.8520",
    "latitude": 19.0380,
    "longitude": 72.8520,
    "status": "pending",
    "message": null,
    "createdAt": "2024-05-20T15:30:00.000Z",
    "acknowledgedAt": null,
    "resolvedAt": null
  }
}
```

#### Success Response (With Message):
```json
{
  "message": "SOS emergency notification created successfully",
  "notification": {
    "_id": "507f1f77bcf86cd799439083",
    "userId": "507f191e810c19729de860ea",
    "fullName": "John Doe",
    "currentLocation": "Mumbai, Maharashtra",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "status": "pending",
    "message": "Need immediate help!",
    "createdAt": "2024-05-20T15:30:00.000Z",
    "acknowledgedAt": null,
    "resolvedAt": null
  }
}
```

---

### Error Responses

#### Error: No Location Provided and No Current Location
**Status**: 400 Bad Request
```json
{
  "message": "Location coordinates are required. Please provide latitude and longitude, or update your current location first."
}
```

#### Error: Unauthorized (No Token)
**Status**: 401 Unauthorized
```json
{
  "message": "No token provided"
}
```

---

## Complete Test Flow

### Step 1: Login to Get JWT Token
```http
POST /api/users/login
Content-Type: application/json
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f191e810c19729de860ea",
    "fullName": "John Doe",
    "email": "user@example.com"
  }
}
```

**Save the token!**

---

### Step 2: Send SOS Request

#### Option A: With Coordinates
```http
POST /api/emergency-notifications/sos
Content-Type: application/json
Authorization: Bearer <your_jwt_token>
```

**Request Body:**
```json
{
  "latitude": 19.0760,
  "longitude": 72.8777,
  "currentLocation": "Mumbai, Maharashtra"
}
```

#### Option B: Without Coordinates (Uses Current Location)
First, update current location:
```http
POST /api/current-location
Content-Type: application/json
Authorization: Bearer <your_jwt_token>
```

**Request:**
```json
{
  "latitude": 19.0760,
  "longitude": 72.8777,
  "city": "Mumbai",
  "state": "Maharashtra"
}
```

Then send SOS:
```http
POST /api/emergency-notifications/sos
Content-Type: application/json
Authorization: Bearer <your_jwt_token>
```

**Request Body:**
```json
{}
```

---

### Step 3: Verify SOS Was Created

#### Fetch All SOS Notifications
```http
GET /api/sos-notifications
Authorization: Bearer <your_jwt_token>
```

**Expected Response:**
```json
{
  "sosNotifications": [
    {
      "_id": "507f1f77bcf86cd799439081",
      "userId": "507f191e810c19729de860ea",
      "fullName": "John Doe",
      "currentLocation": "Mumbai, Maharashtra",
      "latitude": 19.0760,
      "longitude": 72.8777,
      "status": "pending",
      "message": null,
      "createdAt": "2024-05-20T15:30:00.000Z",
      "acknowledgedAt": null,
      "resolvedAt": null
    }
  ]
}
```

#### Fetch Single SOS Notification
```http
GET /api/sos-notifications/507f1f77bcf86cd799439081
Authorization: Bearer <your_jwt_token>
```

---

## Testing with cURL

### Create SOS with Coordinates
```bash
curl -X POST http://localhost:3000/api/emergency-notifications/sos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "latitude": 19.0760,
    "longitude": 72.8777,
    "currentLocation": "Mumbai, Maharashtra"
  }'
```

### Create SOS Without Coordinates (Uses Current Location)
```bash
curl -X POST http://localhost:3000/api/emergency-notifications/sos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{}'
```

---

## Testing with Postman/Thunder Client

### Setup:
1. **Method**: POST
2. **URL**: `http://localhost:3000/api/emergency-notifications/sos`
3. **Headers**: 
   - `Content-Type: application/json`
   - `Authorization: Bearer <your_jwt_token>`
4. **Body** (JSON):
   ```json
   {
     "latitude": 19.0760,
     "longitude": 72.8777,
     "currentLocation": "Mumbai, Maharashtra"
   }
   ```

---

## Test Scenarios

### Scenario 1: SOS with Explicit Coordinates
- **Request**: Include latitude and longitude
- **Expected**: SOS created with provided coordinates
- **Use Case**: User manually triggers SOS with current GPS coordinates

### Scenario 2: SOS Using Current Location
- **Request**: Empty body or no coordinates
- **Expected**: SOS created using user's last known location
- **Use Case**: Quick SOS trigger without GPS access

### Scenario 3: SOS Without Current Location
- **Request**: Empty body, no current location in database
- **Expected**: 400 error asking for coordinates
- **Use Case**: First-time user who hasn't shared location yet

### Scenario 4: Multiple SOS Requests
- **Request**: Send multiple SOS requests
- **Expected**: Each creates a separate emergency notification
- **Use Case**: User in ongoing emergency situation

---

## Sample Coordinates for Testing

| Location | Latitude | Longitude | Description |
|----------|----------|-----------|-------------|
| Mumbai | 19.0760 | 72.8777 | Financial capital |
| Delhi | 28.7041 | 77.1025 | National capital |
| Bangalore | 12.9716 | 77.5946 | Tech hub |
| Chennai | 13.0827 | 80.2707 | South India |
| Kolkata | 22.5726 | 88.3639 | East India |
| Hyderabad | 17.3850 | 78.4867 | South India |

---

## Important Notes

1. **Authentication Required**: JWT token must be provided
2. **Location Priority**: 
   - If coordinates provided → use them
   - If not provided → use current location from database
   - If neither exists → return error
3. **Automatic Location String**: If `currentLocation` not provided, it's auto-generated as "latitude, longitude"
4. **Multiple SOS**: Each SOS request creates a new emergency notification record
5. **Timestamp**: Each SOS is automatically timestamped with `createdAt`

---

## Integration with Other Features

### SOS vs Emergency Notifications
- **SOS Notifications** (`sos_notifications` collection): User-initiated SOS requests
- **Emergency Notifications** (`emergency_notifications` collection): Automatically created by geofencing system
- Both are separate collections and serve different purposes

### SOS + Geofencing
When a user sends SOS from within a geofenced area:
1. SOS is created in `sos_notifications` collection (this endpoint)
2. Geofencing system may have already created an emergency notification in `emergency_notifications` collection
3. Both records will exist in separate collections

### SOS + Safety Score
- Sending SOS doesn't directly affect safety score
- But if user is in a geofenced area, safety score may have already decreased

### SOS + Current Location
- SOS can use current location if coordinates not provided
- SOS coordinates can be different from current location (if user moves)

---

## Response Structure

```typescript
{
  message: string,              // Success message
  notification: {
    _id: string,                // MongoDB ObjectId
    userId: string,             // User ID (from JWT token)
    fullName: string,           // User's full name
    currentLocation: string,    // Location string
    latitude: number,           // Latitude coordinate (required)
    longitude: number,          // Longitude coordinate (required)
    status: string,             // 'pending', 'acknowledged', 'resolved'
    message: string | null,     // Optional message from user
    createdAt: Date,            // Timestamp when created
    acknowledgedAt: Date | null,// Timestamp when acknowledged
    resolvedAt: Date | null     // Timestamp when resolved
  }
}
```

## Collection Information

- **Collection Name**: `sos_notifications`
- **Separate from**: `emergency_notifications` (which is used by geofencing)
- **Status Field**: Tracks SOS request status (pending/acknowledged/resolved)
- **Message Field**: Optional message from user describing the emergency

