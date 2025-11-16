const { EmergencyNotification } = require("../models/emergencyNotification.js");
const { SOSNotification } = require("../models/sosNotification.js");
const { CurrentLocation } = require("../models/currentLocation.js");
const { User } = require("../models/user.js");

module.exports = {
  // ------------------------------------
  //  CREATE SOS (SOS NOTIFICATION)
  // ------------------------------------
  createSOS: async (req, res) => {
    try {
      const userId = req.user.id;
      const { latitude, longitude, currentLocation, message } = req.body;

      let sosLatitude = latitude;
      let sosLongitude = longitude;
      let sosLocation = currentLocation;

      // If coordinates not provided, try to get from user's current location
      if (!sosLatitude || !sosLongitude) {
        const userLocation = await CurrentLocation.findOne({ userId });
        if (userLocation) {
          sosLatitude = userLocation.latitude;
          sosLongitude = userLocation.longitude;
          sosLocation = sosLocation || `${sosLatitude}, ${sosLongitude}`;
        } else {
          // If no location provided and no current location exists, return error
          return res.status(400).json({ 
            message: "Location coordinates are required. Please provide latitude and longitude, or update your current location first." 
          });
        }
      } else {
        // Format location string if not provided
        sosLocation = sosLocation || `${sosLatitude}, ${sosLongitude}`;
      }

      // Get user details for fullName
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create SOS notification in sos_notifications collection
      const sosNotification = new SOSNotification({
        userId,
        currentLocation: sosLocation,
        latitude: sosLatitude,
        longitude: sosLongitude,
        message: message || null,
        status: 'pending'
      });

      await sosNotification.save();

      // Convert to JSON object and add fullName
      const notificationObject = sosNotification.toObject();
      notificationObject.fullName = user.fullName;

      res.status(201).json({
        message: "SOS emergency notification created successfully",
        notification: notificationObject
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }
  },
  // ------------------------------------
  //  FETCH ALL EMERGENCY NOTIFICATIONS
  // ------------------------------------
  fetchAllEmergencyNotifications: async (req, res) => {
    try {
      const userId = req.user.id;
      const notifications = await EmergencyNotification.find({ userId })
        .sort({ createdAt: -1 });
      return res.json({ notifications });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // ------------------------------------
  //  FETCH SINGLE EMERGENCY NOTIFICATION
  // ------------------------------------
  fetchEmergencyNotification: async (req, res) => {
    try {
      const userId = req.user.id;
      const { notificationId } = req.params;

      const notification = await EmergencyNotification.findOne({
        _id: notificationId,
        userId
      });
      if (!notification) {
        return res.status(404).json({ message: "Emergency notification not found" });
      }
      return res.json({ notification });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }
  }
};

