const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * GeoFencing Schema
 */
const GeoFencingSchema = new Schema({
  areaName:    { type: String, required: true },
  latitude:    { type: Number, required: true },
  longitude:   { type: Number, required: true },
  radius:      { type: Number, required: true }, // in meters (or your unit)
  alertLevel:  { type: String, enum: ['low','medium','high','critical'], default: 'medium' },
  description: { type: String },
  createdAt:   { type: Date, default: Date.now }
}, {
  collection: 'geo_fencing'
});

module.exports = GeoFencingSchema;

