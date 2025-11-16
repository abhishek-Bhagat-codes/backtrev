const mongoose = require('mongoose');
const { model } = mongoose;
const NotificationSchema = require('../schemas/notificationSchema');

const Notification = model('Notification', NotificationSchema);

module.exports = {
  Notification
};

