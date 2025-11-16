const mongoose = require('mongoose');
const { model } = mongoose;
const GeoFencingSchema = require('../schemas/geoFencingSchema');

const GeoFencing = model('GeoFencing', GeoFencingSchema);

module.exports = {
  GeoFencing
};

