const mongoose = require('mongoose');
const { model } = mongoose;
const SOSNotificationSchema = require('../schemas/sosNotificationSchema');

const SOSNotification = model('SOSNotification', SOSNotificationSchema);

module.exports = {
  SOSNotification
};

