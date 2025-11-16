const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Notification Schema
 */
const NotificationSchema = new Schema({
  userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content:   { type: String, required: true },
  level:     { type: String, enum: ['info','warning','error','critical','success'], default: 'info' },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'notifications'
});

module.exports = NotificationSchema;

