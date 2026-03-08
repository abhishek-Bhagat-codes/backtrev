const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * EmergencyNotification (SOS) Schema
 */
const EmergencyNotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum:['active','acknowledged','dispatched'], default:'active' },
  currentLocation:{ type: String },
  latitude:       { type: Number },
  longitude:      { type: Number },
  createdAt:      { type: Date, default: Date.now }
}, {
  collection: 'emergency_notifications'
});

module.exports = EmergencyNotificationSchema;

