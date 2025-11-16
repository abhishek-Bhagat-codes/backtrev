const mongoose = require('mongoose');
const { model } = mongoose;
const EmergencyContactSchema = require('../schemas/emergencyContactSchema');

const EmergencyContact = model('EmergencyContact', EmergencyContactSchema);

module.exports = {
  EmergencyContact
};

