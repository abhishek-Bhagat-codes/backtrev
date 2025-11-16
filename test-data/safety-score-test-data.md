# Safety Score Endpoints Test Data

## Base URL
```
http://localhost:3000/api/safety-score
```

## Authentication
All endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## FETCH SAFETY SCORE (GET /api/safety-score)

### Request
```http
GET /api/safety-score
Authorization: Bearer <your_jwt_token>
```

### Expected Response Examples

#### Example 1: High Safety Score (Safe Area)
```json
{
  "safetyScore": {
    "_id": "507f1f77bcf86cd799439021",
    "userId": "507f191e810c19729de860ea",
    "safetyScore": 85,
    "lastUpdated": "2024-05-20T10:30:00.000Z"
  }
}
```

#### Example 2: Medium Safety Score (Moderate Risk)
```json
{
  "safetyScore": {
    "_id": "507f1f77bcf86cd799439022",
    "userId": "507f191e810c19729de860ea",
    "safetyScore": 65,
    "lastUpdated": "2024-05-20T14:15:00.000Z"
  }
}
```

#### Example 3: Low Safety Score (High Risk)
```json
{
  "safetyScore": {
    "_id": "507f1f77bcf86cd799439023",
    "userId": "507f191e810c19729de860ea",
    "safetyScore": 35,
    "lastUpdated": "2024-05-20T18:45:00.000Z"
  }
}
```

#### Example 4: Very High Safety Score (Very Safe)
```json
{
  "safetyScore": {
    "_id": "507f1f77bcf86cd799439024",
    "userId": "507f191e810c19729de860ea",
    "safetyScore": 95,
    "lastUpdated": "2024-05-21T09:00:00.000Z"
  }
}
```

#### Example 5: Borderline Low Score
```json
{
  "safetyScore": {
    "_id": "507f1f77bcf86cd799439025",
    "userId": "507f191e810c19729de860ea",
    "safetyScore": 50,
    "lastUpdated": "2024-05-21T12:30:00.000Z"
  }
}
```

### Error Response (404 Not Found)
```json
{
  "message": "Safety score not found"
}
```

---

## Safety Score Ranges

The safety score is a number between **0 and 100**:
- **90-100**: Very Safe (Excellent)
- **75-89**: Safe (Good)
- **60-74**: Moderate (Fair)
- **45-59**: Caution (Below Average)
- **30-44**: Risky (Poor)
- **0-29**: Very Risky (Critical)

---

## Testing with cURL

### Fetch Safety Score
```bash
curl -X GET http://localhost:3000/api/safety-score \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Testing with Postman/Thunder Client

### Setup:
1. **Method**: GET
2. **URL**: `http://localhost:3000/api/safety-score`
3. **Headers**: 
   - `Authorization: Bearer <your_jwt_token>`

### Quick Test:
1. First, login to get JWT token: `POST /api/users/login`
2. Fetch safety score: `GET /api/safety-score`

---

## Sample Data for Database (MongoDB)

If you want to manually insert safety score data for testing, use these examples:

### Insert via MongoDB Shell:
```javascript
db.safety_scores.insertOne({
  userId: ObjectId("507f191e810c19729de860ea"),
  safetyScore: 85,
  lastUpdated: new Date()
})
```

### Insert via MongoDB Compass or Studio 3T:
```json
{
  "userId": "507f191e810c19729de860ea",
  "safetyScore": 85,
  "lastUpdated": "2024-05-20T10:30:00.000Z"
}
```

### Multiple Test Records:
```json
[
  {
    "userId": "507f191e810c19729de860ea",
    "safetyScore": 95,
    "lastUpdated": "2024-05-20T10:00:00.000Z"
  },
  {
    "userId": "507f191e810c19729de860ea",
    "safetyScore": 75,
    "lastUpdated": "2024-05-20T11:00:00.000Z"
  },
  {
    "userId": "507f191e810c19729de860ea",
    "safetyScore": 55,
    "lastUpdated": "2024-05-20T12:00:00.000Z"
  },
  {
    "userId": "507f191e810c19729de860ea",
    "safetyScore": 40,
    "lastUpdated": "2024-05-20T13:00:00.000Z"
  },
  {
    "userId": "507f191e810c19729de860ea",
    "safetyScore": 20,
    "lastUpdated": "2024-05-20T14:00:00.000Z"
  }
]
```

**Note**: Replace `userId` with an actual user ID from your database. Only one safety score record per user should exist (the endpoint fetches by userId).

---

## Expected Response Structure

```typescript
{
  safetyScore: {
    _id: string,           // MongoDB ObjectId
    userId: string,        // MongoDB ObjectId (reference to User)
    safetyScore: number,   // 0-100
    lastUpdated: Date      // ISO 8601 date string
  }
}
```

---

## Test Scenarios

### Scenario 1: User with High Safety Score
- **Expected**: Returns safety score object with value 85-100
- **Use Case**: User in a safe location

### Scenario 2: User with Low Safety Score
- **Expected**: Returns safety score object with value 0-45
- **Use Case**: User in a risky area

### Scenario 3: User with No Safety Score
- **Expected**: 404 error with message "Safety score not found"
- **Use Case**: New user or safety score not yet calculated

### Scenario 4: Multiple Requests
- **Expected**: Same safety score returned (cached or latest)
- **Use Case**: Checking if score updates in real-time


