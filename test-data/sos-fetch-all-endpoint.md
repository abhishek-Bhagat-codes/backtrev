# Fetch All SOS Notifications Endpoint

## Endpoint
```
GET /api/sos-notifications/all
```

## Authentication
Requires JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Query Parameters

### `limit` (Optional)
- **Type**: Number
- **Default**: 10
- **Description**: Maximum number of SOS notifications to return
- **Example**: `?limit=20`

### `status` (Optional)
- **Type**: String
- **Values**: `pending`, `acknowledged`, `resolved`
- **Description**: Filter SOS notifications by status
- **Example**: `?status=pending`

---

## Request Examples

### Fetch All SOS (Default Limit: 10)
```http
GET /api/sos-notifications/all
Authorization: Bearer <your_jwt_token>
```

### Fetch All SOS with Custom Limit
```http
GET /api/sos-notifications/all?limit=20
Authorization: Bearer <your_jwt_token>
```

### Fetch All Pending SOS
```http
GET /api/sos-notifications/all?status=pending
Authorization: Bearer <your_jwt_token>
```

### Fetch All Acknowledged SOS with Limit
```http
GET /api/sos-notifications/all?status=acknowledged&limit=15
Authorization: Bearer <your_jwt_token>
```

### Fetch All Resolved SOS
```http
GET /api/sos-notifications/all?status=resolved&limit=50
Authorization: Bearer <your_jwt_token>
```

---

## Response Examples

### Success Response (Default - 10 items)
```json
{
  "sosNotifications": [
    {
      "_id": "507f1f77bcf86cd799439081",
      "userId": "507f191e810c19729de860ea",
      "fullName": "John Doe",
      "userEmail": "john@example.com",
      "userPhone": "+919876543210",
      "currentLocation": "Mumbai, Maharashtra",
      "latitude": 19.0760,
      "longitude": 72.8777,
      "status": "pending",
      "message": "Need immediate help! Stranded at Mumbai airport",
      "createdAt": "2024-05-20T10:30:00.000Z",
      "acknowledgedAt": null,
      "resolvedAt": null
    },
    {
      "_id": "507f1f77bcf86cd799439082",
      "userId": "507f191e810c19729de860eb",
      "fullName": "Jane Smith",
      "userEmail": "jane@example.com",
      "userPhone": "+919123456789",
      "currentLocation": "Delhi, India",
      "latitude": 28.7041,
      "longitude": 77.1025,
      "status": "acknowledged",
      "message": "Emergency situation at Connaught Place",
      "createdAt": "2024-05-20T14:00:00.000Z",
      "acknowledgedAt": "2024-05-20T14:15:00.000Z",
      "resolvedAt": null
    }
  ],
  "limit": 10,
  "total": 25,
  "returned": 10
}
```

### Success Response (Filtered by Status)
```json
{
  "sosNotifications": [
    {
      "_id": "507f1f77bcf86cd799439081",
      "userId": "507f191e810c19729de860ea",
      "fullName": "John Doe",
      "userEmail": "john@example.com",
      "userPhone": "+919876543210",
      "currentLocation": "Mumbai, Maharashtra",
      "latitude": 19.0760,
      "longitude": 72.8777,
      "status": "pending",
      "message": "Need immediate help!",
      "createdAt": "2024-05-20T10:30:00.000Z",
      "acknowledgedAt": null,
      "resolvedAt": null
    }
  ],
  "limit": 10,
  "total": 5,
  "returned": 1
}
```

---

## Response Structure

```typescript
{
  sosNotifications: Array<{
    _id: string,
    userId: string,
    fullName: string,        // User's full name
    userEmail: string,       // User's email
    userPhone: string,       // User's phone number
    currentLocation: string,
    latitude: number,
    longitude: number,
    status: string,          // 'pending', 'acknowledged', 'resolved'
    message: string | null,
    createdAt: Date,
    acknowledgedAt: Date | null,
    resolvedAt: Date | null
  }>,
  limit: number,             // Requested limit
  total: number,             // Total count matching the query
  returned: number           // Number of items returned
}
```

---

## Testing with cURL

### Fetch All SOS (Default Limit: 10)
```bash
curl -X GET "http://localhost:3000/api/sos-notifications/all" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Fetch All SOS with Limit 20
```bash
curl -X GET "http://localhost:3000/api/sos-notifications/all?limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Fetch All Pending SOS
```bash
curl -X GET "http://localhost:3000/api/sos-notifications/all?status=pending" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Fetch All Acknowledged SOS with Limit 15
```bash
curl -X GET "http://localhost:3000/api/sos-notifications/all?status=acknowledged&limit=15" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Use Cases

### 1. Dashboard View
Fetch the latest 10 SOS notifications for admin dashboard:
```
GET /api/sos-notifications/all?limit=10
```

### 2. Pending SOS Queue
Fetch all pending SOS notifications that need attention:
```
GET /api/sos-notifications/all?status=pending
```

### 3. Recent Activity
Fetch the most recent 20 SOS notifications:
```
GET /api/sos-notifications/all?limit=20
```

### 4. Status Filtering
Fetch all resolved SOS notifications:
```
GET /api/sos-notifications/all?status=resolved&limit=50
```

---

## Important Notes

1. **Authentication Required**: JWT token must be provided
2. **Default Limit**: If no limit is specified, returns 10 items
3. **Sorting**: Results are sorted by `createdAt` in descending order (newest first)
4. **User Information**: Includes user's fullName, email, and phoneNumber
5. **Total Count**: Returns total count of matching records (useful for pagination)
6. **All Users**: This endpoint returns SOS from ALL users, not just the authenticated user

---

## Comparison with Other Endpoints

| Endpoint | Returns | Limit | Filter |
|----------|---------|-------|--------|
| `GET /api/sos-notifications` | User's SOS only | No | No |
| `GET /api/sos-notifications/all` | All users' SOS | Yes (default: 10) | Yes (by status) |
| `GET /api/sos-notifications/:id` | Single SOS | N/A | N/A |

---

## Example Response Metadata

The response includes helpful metadata:
- **limit**: The limit you requested (or default 10)
- **total**: Total number of SOS notifications matching your query
- **returned**: Number of items actually returned (may be less than limit if fewer records exist)

This is useful for pagination and understanding how many more records are available.

