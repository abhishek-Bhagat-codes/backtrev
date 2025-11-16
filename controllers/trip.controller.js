const { Trip } = require("../models/trip.js");

module.exports = {
  // ------------------------------------
  //  SAVE TRIP
  // ------------------------------------
  saveTrip: async (req, res) => {
    try {
      const userId = req.user.id; // from auth middleware
      const {
        tripName,
        startingLocation,
        endingLocation,
        startingDandT,
        endingDandT,
        intermediateStops,
        transportation,
        hotelName,
        emergencyContact,
        contactName
      } = req.body;

      const newTrip = new Trip({
        userId,
        tripName,
        startingLocation,
        endingLocation,
        startingDandT,
        endingDandT,
        intermediateStops,
        transportation,
        hotelName,
        emergencyContact,
        contactName
      });

      await newTrip.save();

      res.status(201).json({
        message: "Trip saved successfully",
        trip: newTrip
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // ------------------------------------
  //  UPDATE TRIP
  // ------------------------------------
  updateTrip: async (req, res) => {
    try {
      const userId = req.user.id;
      const { tripId } = req.params;
      const {
        tripName,
        startingLocation,
        endingLocation,
        startingDandT,
        endingDandT,
        intermediateStops,
        transportation,
        hotelName,
        emergencyContact,
        contactName
      } = req.body;

      const trip = await Trip.findOne({ _id: tripId, userId });
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }

      const updatedTrip = await Trip.findByIdAndUpdate(
        tripId,
        {
          tripName,
          startingLocation,
          endingLocation,
          startingDandT,
          endingDandT,
          intermediateStops,
          transportation,
          hotelName,
          emergencyContact,
          contactName
        },
        { new: true }
      );

      res.json({
        message: "Trip updated successfully",
        trip: updatedTrip
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // ------------------------------------
  //  FETCH ALL TRIPS
  // ------------------------------------
  fetchAllTrips: async (req, res) => {
    try {
      const userId = req.user.id;
      const trips = await Trip.find({ userId }).sort({ createdAt: -1 });
      return res.json({ trips });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // ------------------------------------
  //  FETCH SINGLE TRIP
  // ------------------------------------
  fetchTrip: async (req, res) => {
    try {
      const userId = req.user.id;
      const { tripId } = req.params;

      const trip = await Trip.findOne({ _id: tripId, userId });
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      return res.json({ trip });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }
  }
};

