const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Trip Schema
 */
const TripSchema = new Schema({
  userId:            { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tripName:          { type: String, required: true, trim: true },
  startingLocation:  { type: String },
  endingLocation:    { type: String },
  startingDandT:     { type: String }, // Date & time
  endingDandT:       { type: String },
  intermediateStops: { type: String }, // kept as text; could be an array of strings if needed
  transportation:    { type: String },
  hotelName:         { type: String },
  emergencyContact:  { type: String }, // Emergency contact phone number
  contactName:       { type: String }, // Emergency contact name
  createdAt:         { type: Date, default: Date.now }
}, {
  collection: 'trips'
});

module.exports = TripSchema;

