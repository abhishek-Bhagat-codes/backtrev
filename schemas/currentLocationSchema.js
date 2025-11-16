const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * CurrentLocation Schema
 */
const CurrentLocationSchema = new Schema({
  userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  latitude:  { type: Number, required: true },
  longitude: { type: Number, required: true },
  isDanger: { type: Boolean, default: false },
  dangerLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: null },
  city:      { type: String },
  state:     { type: String },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'current_locations'
});

// optional: create a 2dsphere index if you want geo queries later
// CurrentLocationSchema.index({ latitude: 1, longitude: 1 });
// or better, use GeoJSON and index: { location: '2dsphere' }

module.exports = CurrentLocationSchema;

