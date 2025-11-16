const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * SOS Notification Schema
 * Stores SOS emergency requests from users
 */
const SOSNotificationSchema = new Schema({
  userId:         { type: Schema.Types.ObjectId, ref: 'User', required: true },
  currentLocation:{ type: String },
  latitude:       { type: Number, required: true },
  longitude:      { type: Number, required: true },
  status:         { type: String, enum: ['pending', 'acknowledged', 'resolved'], default: 'pending' },
  message:        { type: String }, // Optional message from user
  createdAt:      { type: Date, default: Date.now },
  acknowledgedAt: { type: Date },
  resolvedAt:     { type: Date }
}, {
  collection: 'sos_notifications'
});

module.exports = SOSNotificationSchema;

