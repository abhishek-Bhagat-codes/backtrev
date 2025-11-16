// MongoDB Collection Insert Script for SOS Notifications
// Run this in MongoDB shell or MongoDB Compass

// Connect to your database first
// use your_database_name

db.sos_notifications.insertMany([
  {
    userId: ObjectId("507f191e810c19729de860ea"),
    currentLocation: "Mumbai, Maharashtra",
    latitude: 19.0760,
    longitude: 72.8777,
    status: "pending",
    message: "Need immediate help! Stranded at Mumbai airport",
    createdAt: ISODate("2024-05-20T10:30:00.000Z"),
    acknowledgedAt: null,
    resolvedAt: null
  },
  {
    userId: ObjectId("507f191e810c19729de860ea"),
    currentLocation: "Delhi, India",
    latitude: 28.7041,
    longitude: 77.1025,
    status: "acknowledged",
    message: "Emergency situation at Connaught Place",
    createdAt: ISODate("2024-05-20T14:00:00.000Z"),
    acknowledgedAt: ISODate("2024-05-20T14:15:00.000Z"),
    resolvedAt: null
  },
  {
    userId: ObjectId("507f191e810c19729de860ea"),
    currentLocation: "Bangalore City Center",
    latitude: 12.9716,
    longitude: 77.5946,
    status: "resolved",
    message: "SOS request from Bangalore",
    createdAt: ISODate("2024-05-19T09:00:00.000Z"),
    acknowledgedAt: ISODate("2024-05-19T09:10:00.000Z"),
    resolvedAt: ISODate("2024-05-19T09:45:00.000Z")
  },
  {
    userId: ObjectId("507f191e810c19729de860ea"),
    currentLocation: "Chennai Beach",
    latitude: 13.0827,
    longitude: 80.2707,
    status: "pending",
    message: "Help needed urgently",
    createdAt: ISODate("2024-05-21T08:00:00.000Z"),
    acknowledgedAt: null,
    resolvedAt: null
  },
  {
    userId: ObjectId("507f191e810c19729de860ea"),
    currentLocation: "Kolkata, West Bengal",
    latitude: 22.5726,
    longitude: 88.3639,
    status: "acknowledged",
    message: "Emergency assistance required",
    createdAt: ISODate("2024-05-21T12:30:00.000Z"),
    acknowledgedAt: ISODate("2024-05-21T12:35:00.000Z"),
    resolvedAt: null
  },
  {
    userId: ObjectId("507f191e810c19729de860ea"),
    currentLocation: "Hyderabad, Telangana",
    latitude: 17.3850,
    longitude: 78.4867,
    status: "pending",
    message: "SOS alert activated",
    createdAt: ISODate("2024-05-21T15:00:00.000Z"),
    acknowledgedAt: null,
    resolvedAt: null
  },
  {
    userId: ObjectId("507f191e810c19729de860ea"),
    currentLocation: "Pune, Maharashtra",
    latitude: 18.5204,
    longitude: 73.8567,
    status: "resolved",
    message: "Need help immediately",
    createdAt: ISODate("2024-05-18T16:00:00.000Z"),
    acknowledgedAt: ISODate("2024-05-18T16:05:00.000Z"),
    resolvedAt: ISODate("2024-05-18T16:30:00.000Z")
  },
  {
    userId: ObjectId("507f191e810c19729de860ea"),
    currentLocation: "19.0380, 72.8520",
    latitude: 19.0380,
    longitude: 72.8520,
    status: "pending",
    message: null,
    createdAt: ISODate("2024-05-22T10:00:00.000Z"),
    acknowledgedAt: null,
    resolvedAt: null
  }
]);

// To verify insertion:
// db.sos_notifications.find().pretty()

// To count documents:
// db.sos_notifications.countDocuments()

// To find by status:
// db.sos_notifications.find({ status: "pending" }).pretty()

// To find by userId:
// db.sos_notifications.find({ userId: ObjectId("507f191e810c19729de860ea") }).pretty()

