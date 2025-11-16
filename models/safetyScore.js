const mongoose = require('mongoose');
const { model } = mongoose;
const SafetyScoreSchema = require('../schemas/safetyScoreSchema');

const SafetyScore = model('SafetyScore', SafetyScoreSchema);

module.exports = {
  SafetyScore
};

