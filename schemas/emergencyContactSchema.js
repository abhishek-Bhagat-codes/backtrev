const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * EmergencyContact Schema
 */
const EmergencyContactSchema = new Schema({
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  contactName:  { type: String, required: true },
  contactPhone: { type: String, required: true },
  relation:     { type: String }
}, {
  collection: 'emergency_contacts',
  timestamps: false
});

module.exports = EmergencyContactSchema;

