const { GeoFencing } = require("../models/geoFencing.js");

module.exports = {
  // ------------------------------------
  //  CREATE GEOFENCE
  // ------------------------------------
  createGeofence: async (req, res) => {
    try {
      const {
        areaName,
        latitude,
        longitude,
        radius,
        alertLevel,
        description
      } = req.body;

      if (!areaName || latitude === undefined || longitude === undefined || radius === undefined) {
        return res.status(400).json({ 
          message: "areaName, latitude, longitude, and radius are required" 
        });
      }

      if (radius <= 0) {
        return res.status(400).json({ 
          message: "Radius must be greater than 0" 
        });
      }

      const newGeofence = new GeoFencing({
        areaName,
        latitude,
        longitude,
        radius,
        alertLevel: alertLevel || 'medium',
        description
      });

      await newGeofence.save();

      res.status(201).json({
        message: "Geofence created successfully",
        geofence: newGeofence
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // ------------------------------------
  //  UPDATE GEOFENCE
  // ------------------------------------
  updateGeofence: async (req, res) => {
    try {
      const { geofenceId } = req.params;
      const {
        areaName,
        latitude,
        longitude,
        radius,
        alertLevel,
        description
      } = req.body;

      const geofence = await GeoFencing.findById(geofenceId);
      if (!geofence) {
        return res.status(404).json({ message: "Geofence not found" });
      }

      if (radius !== undefined && radius <= 0) {
        return res.status(400).json({ 
          message: "Radius must be greater than 0" 
        });
      }

      const updatedGeofence = await GeoFencing.findByIdAndUpdate(
        geofenceId,
        {
          areaName,
          latitude,
          longitude,
          radius,
          alertLevel,
          description
        },
        { new: true }
      );

      res.json({
        message: "Geofence updated successfully",
        geofence: updatedGeofence
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // ------------------------------------
  //  FETCH ALL GEOFENCES
  // ------------------------------------
  fetchAllGeofences: async (req, res) => {
    try {
      const geofences = await GeoFencing.find().sort({ createdAt: -1 });
      return res.json({ geofences });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // ------------------------------------
  //  FETCH SINGLE GEOFENCE
  // ------------------------------------
  fetchGeofence: async (req, res) => {
    try {
      const { geofenceId } = req.params;

      const geofence = await GeoFencing.findById(geofenceId);
      if (!geofence) {
        return res.status(404).json({ message: "Geofence not found" });
      }
      return res.json({ geofence });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // ------------------------------------
  //  DELETE GEOFENCE
  // ------------------------------------
  deleteGeofence: async (req, res) => {
    try {
      const { geofenceId } = req.params;

      const geofence = await GeoFencing.findByIdAndDelete(geofenceId);
      if (!geofence) {
        return res.status(404).json({ message: "Geofence not found" });
      }

      res.json({
        message: "Geofence deleted successfully"
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }
  }
};

