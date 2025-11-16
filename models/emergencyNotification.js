const mongoose = require('mongoose');
const { model } = mongoose;
const EmergencyNotificationSchema = require('../schemas/emergencyNotificationSchema');

const EmergencyNotification = model('EmergencyNotification', EmergencyNotificationSchema);

module.exports = {
  EmergencyNotification
};

