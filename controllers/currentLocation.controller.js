const { CurrentLocation } = require("../models/currentLocation.js");
const { GeoFencing } = require("../models/geoFencing.js");
const { SafetyScore } = require("../models/safetyScore.js");
const { EmergencyNotification } = require("../models/emergencyNotification.js");
const { isWithinGeofence, calculateSafetyScoreDecrease } = require("../utils/geofencing.js");

module.exports = {
  // ------------------------------------
  //  SAVE CURRENT LOCATION
  // ------------------------------------
  saveCurrentLocation: async (req, res) => {
    try {
      const userId = req.user.id;
      const { latitude, longitude, city, state } = req.body;

      if (!latitude || !longitude) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }

      // Check geofencing
      const geofences = await GeoFencing.find();
      let matchedGeofence = null;
      let isDanger = false;
      let dangerLevel = null;

      for (const geofence of geofences) {
        if (isWithinGeofence(latitude, longitude, geofence.latitude, geofence.longitude, geofence.radius)) {
          matchedGeofence = geofence;
          isDanger = true;
          dangerLevel = geofence.alertLevel;
          break; // Use the first matched geofence
        }
      }

      // Check if location already exists for user, if so update it
      const existingLocation = await CurrentLocation.findOne({ userId });
      
      if (existingLocation) {
        // Update existing location
        const updatedLocation = await CurrentLocation.findByIdAndUpdate(
          existingLocation._id,
          {
            latitude,
            longitude,
            city,
            state,
            isDanger,
            dangerLevel: dangerLevel || null,
            updatedAt: new Date()
          },
          { new: true }
        );

        // If in geofenced area, decrease safety score and create emergency notification
        if (matchedGeofence) {
          await handleGeofenceMatch(userId, latitude, longitude, matchedGeofence);
        }

        return res.json({
          message: "Current location updated successfully",
          location: updatedLocation,
          geofenceAlert: matchedGeofence ? {
            areaName: matchedGeofence.areaName,
            alertLevel: matchedGeofence.alertLevel,
            message: `Warning: You are in a ${matchedGeofence.alertLevel} risk area: ${matchedGeofence.areaName}`
          } : null
        });
      } else {
        // Create new location
        const newLocation = new CurrentLocation({
          userId,
          latitude,
          longitude,
          city,
          state,
          isDanger,
          dangerLevel: dangerLevel || null
        });
        await newLocation.save();

        // If in geofenced area, decrease safety score and create emergency notification
        if (matchedGeofence) {
          await handleGeofenceMatch(userId, latitude, longitude, matchedGeofence);
        }

        return res.status(201).json({
          message: "Current location saved successfully",
          location: newLocation,
          geofenceAlert: matchedGeofence ? {
            areaName: matchedGeofence.areaName,
            alertLevel: matchedGeofence.alertLevel,
            message: `Warning: You are in a ${matchedGeofence.alertLevel} risk area: ${matchedGeofence.areaName}`
          } : null
        });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // ------------------------------------
  //  UPDATE CURRENT LOCATION
  // ------------------------------------
  updateCurrentLocation: async (req, res) => {
    try {
      const userId = req.user.id;
      const { latitude, longitude, city, state } = req.body;

      if (!latitude || !longitude) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }

      const location = await CurrentLocation.findOne({ userId });
      if (!location) {
        return res.status(404).json({ message: "Current location not found" });
      }

      // Check geofencing
      const geofences = await GeoFencing.find();
      let matchedGeofence = null;
      let isDanger = false;
      let dangerLevel = null;

      for (const geofence of geofences) {
        if (isWithinGeofence(latitude, longitude, geofence.latitude, geofence.longitude, geofence.radius)) {
          matchedGeofence = geofence;
          isDanger = true;
          dangerLevel = geofence.alertLevel;
          break; // Use the first matched geofence
        }
      }

      const updatedLocation = await CurrentLocation.findByIdAndUpdate(
        location._id,
        {
          latitude,
          longitude,
          city,
          state,
          isDanger,
          dangerLevel: dangerLevel || null,
          updatedAt: new Date()
        },
        { new: true }
      );

      // If in geofenced area, decrease safety score and create emergency notification
      if (matchedGeofence) {
        await handleGeofenceMatch(userId, latitude, longitude, matchedGeofence);
      }

      res.json({
        message: "Current location updated successfully",
        location: updatedLocation,
        geofenceAlert: matchedGeofence ? {
          areaName: matchedGeofence.areaName,
          alertLevel: matchedGeofence.alertLevel,
          message: `Warning: You are in a ${matchedGeofence.alertLevel} risk area: ${matchedGeofence.areaName}`
        } : null
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // ------------------------------------
  //  FETCH CURRENT LOCATION
  // ------------------------------------
  fetchCurrentLocation: async (req, res) => {
    try {
      const userId = req.user.id;

      const location = await CurrentLocation.findOne({ userId });
      if (!location) {
        return res.status(404).json({ message: "Current location not found" });
      }

      res.json({ location });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }
  }
};

// ------------------------------------
//  HELPER FUNCTION: Handle Geofence Match
// ------------------------------------
async function handleGeofenceMatch(userId, latitude, longitude, geofence) {
  try {
    // Decrease safety score
    let safetyScore = await SafetyScore.findOne({ userId });
    
    if (safetyScore) {
      const newScore = calculateSafetyScoreDecrease(geofence.alertLevel, safetyScore.safetyScore);
      safetyScore.safetyScore = newScore;
      safetyScore.lastUpdated = new Date();
      await safetyScore.save();
    } else {
      // Create safety score if it doesn't exist (start with 100 and decrease)
      const initialScore = calculateSafetyScoreDecrease(geofence.alertLevel, 100);
      safetyScore = new SafetyScore({
        userId,
        safetyScore: initialScore,
        lastUpdated: new Date()
      });
      await safetyScore.save();
    }

    // Create emergency notification
    const emergencyNotification = new EmergencyNotification({
      userId,
      currentLocation: `${latitude}, ${longitude}`,
      latitude,
      longitude
    });
    await emergencyNotification.save();

    console.log(`Geofence alert triggered for user ${userId} in area ${geofence.areaName}. Safety score decreased to ${safetyScore.safetyScore}`);
  } catch (err) {
    console.error("Error handling geofence match:", err);
    // Don't throw error, just log it so location update can still succeed
  }
}

