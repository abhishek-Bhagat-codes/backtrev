const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * SafetyScore Schema
 */
const SafetyScoreSchema = new Schema({
  userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  safetyScore: { type: Number, required: true, min: 0, max: 100 },
  lastUpdated: { type: Date, default: Date.now }
}, {
  collection: 'safety_scores'
});

module.exports = SafetyScoreSchema;

