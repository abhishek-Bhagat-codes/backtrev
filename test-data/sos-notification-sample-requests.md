# SOS Notification Sample Requests & Data

## Quick Test Requests

### Create SOS with Full Data
```http
POST /api/emergency-notifications/sos
Content-Type: application/json
Authorization: Bearer <your_jwt_token>
```

```json
{
  "latitude": 19.0760,
  "longitude": 72.8777,
  "currentLocation": "Mumbai, Maharashtra",
  "message": "Need immediate help! Stranded at Mumbai airport"
}
```

### Create SOS with Minimal Data
```json
{
  "latitude": 19.0760,
  "longitude": 72.8777
}
```

### Create SOS without Coordinates (Uses Current Location)
```json
{}
```

---

## Sample SOS Notification Data

### Example 1: Pending SOS (Mumbai)
```json
{
  "latitude": 19.0760,
  "longitude": 72.8777,
  "currentLocation": "Mumbai, Maharashtra",
  "message": "Need immediate help! Stranded at Mumbai airport"
}
```

### Example 2: Emergency SOS (Delhi)
```json
{
  "latitude": 28.7041,
  "longitude": 77.1025,
  "currentLocation": "Delhi, India",
  "message": "Emergency situation at Connaught Place"
}
```

### Example 3: Urgent SOS (Chennai)
```json
{
  "latitude": 13.0827,
  "longitude": 80.2707,
  "currentLocation": "Chennai Beach",
  "message": "Help needed urgently"
}
```

### Example 4: Quick SOS (Bangalore)
```json
{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "currentLocation": "Bangalore City Center",
  "message": "SOS request from Bangalore"
}
```

### Example 5: Emergency Alert (Kolkata)
```json
{
  "latitude": 22.5726,
  "longitude": 88.3639,
  "currentLocation": "Kolkata, West Bengal",
  "message": "Emergency assistance required"
}
```

### Example 6: SOS Alert (Hyderabad)
```json
{
  "latitude": 17.3850,
  "longitude": 78.4867,
  "currentLocation": "Hyderabad, Telangana",
  "message": "SOS alert activated"
}
```

### Example 7: Help Request (Pune)
```json
{
  "latitude": 18.5204,
  "longitude": 73.8567,
  "currentLocation": "Pune, Maharashtra",
  "message": "Need help immediately"
}
```

### Example 8: No Message (Coordinates Only)
```json
{
  "latitude": 19.0380,
  "longitude": 72.8520
}
```

---

## Expected Responses

### Success Response
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
    "message": "Need immediate help! Stranded at Mumbai airport",
    "createdAt": "2024-05-20T10:30:00.000Z",
    "acknowledgedAt": null,
    "resolvedAt": null
  }
}
```

---

## MongoDB Collection Data

### Collection Name
`sos_notifications`

### Sample Documents

**Document 1: Pending SOS**
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439081"),
  userId: ObjectId("507f191e810c19729de860ea"),
  currentLocation: "Mumbai, Maharashtra",
  latitude: 19.0760,
  longitude: 72.8777,
  status: "pending",
  message: "Need immediate help! Stranded at Mumbai airport",
  createdAt: ISODate("2024-05-20T10:30:00.000Z"),
  acknowledgedAt: null,
  resolvedAt: null
}
```

**Document 2: Acknowledged SOS**
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439082"),
  userId: ObjectId("507f191e810c19729de860ea"),
  currentLocation: "Delhi, India",
  latitude: 28.7041,
  longitude: 77.1025,
  status: "acknowledged",
  message: "Emergency situation at Connaught Place",
  createdAt: ISODate("2024-05-20T14:00:00.000Z"),
  acknowledgedAt: ISODate("2024-05-20T14:15:00.000Z"),
  resolvedAt: null
}
```

**Document 3: Resolved SOS**
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439083"),
  userId: ObjectId("507f191e810c19729de860ea"),
  currentLocation: "Bangalore City Center",
  latitude: 12.9716,
  longitude: 77.5946,
  status: "resolved",
  message: "SOS request from Bangalore",
  createdAt: ISODate("2024-05-19T09:00:00.000Z"),
  acknowledgedAt: ISODate("2024-05-19T09:10:00.000Z"),
  resolvedAt: ISODate("2024-05-19T09:45:00.000Z")
}
```

---

## MongoDB Queries

### Find All SOS Notifications
```javascript
db.sos_notifications.find().pretty()
```

### Find Pending SOS Notifications
```javascript
db.sos_notifications.find({ status: "pending" }).pretty()
```

### Find SOS by User
```javascript
db.sos_notifications.find({ 
  userId: ObjectId("507f191e810c19729de860ea") 
}).pretty()
```

### Find Recent SOS (Last 24 hours)
```javascript
db.sos_notifications.find({
  createdAt: { 
    $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) 
  }
}).pretty()
```

### Count by Status
```javascript
db.sos_notifications.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])
```

---

## Testing Sequence

1. **Create SOS Notification**
   ```bash
   POST /api/emergency-notifications/sos
   ```

2. **Verify in Database**
   ```javascript
   db.sos_notifications.find().sort({ createdAt: -1 }).limit(1).pretty()
   ```

3. **Fetch SOS Notifications**
   ```bash
   GET /api/sos-notifications
   ```

4. **Fetch Single SOS**
   ```bash
   GET /api/sos-notifications/:sosNotificationId
   ```

---

## Notes

- Replace `userId` ObjectId with actual user ID from your database
- All timestamps are in ISO 8601 format
- `message` field is optional (can be null)
- `status` can be: "pending", "acknowledged", or "resolved"
- `acknowledgedAt` and `resolvedAt` are null initially for pending SOS

