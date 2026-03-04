/**
 * Models Index
 * Central export point for all models
 * 
 * Usage:
 * const { User, Trip, ... } = require('./models');
 */

const { User } = require('./user');
const { Trip } = require('./trip');
const { EmergencyContact } = require('./emergencyContact');
const { Notification } = require('./notification');
const { CurrentLocation } = require('./currentLocation');
const { GeoFencing } = require('./geoFencing');
const { SafetyScore } = require('./safetyScore');
const { EmergencyNotification } = require('./emergencyNotification');
const { SOSNotification } = require('./sosNotification');

module.exports = {
  User,
  Trip,
  EmergencyContact,
  Notification,
  CurrentLocation,
  GeoFencing,
  SafetyScore,
  EmergencyNotification,
  SOSNotification
};

