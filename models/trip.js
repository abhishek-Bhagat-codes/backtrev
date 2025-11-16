const mongoose = require('mongoose');
const { model } = mongoose;
const TripSchema = require('../schemas/tripSchema');

const Trip = model('Trip', TripSchema);

module.exports = {
  Trip
};

