const mongoose = require('mongoose');
const { model } = mongoose;
const CurrentLocationSchema = require('../schemas/currentLocationSchema');

const CurrentLocation = model('CurrentLocation', CurrentLocationSchema);

module.exports = {
  CurrentLocation
};

