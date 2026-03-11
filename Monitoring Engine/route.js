const axios = require("axios");

async function getRoute(origin, destination) {

  const url = `http://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;

  const response = await axios.get(url);

  return response.data.routes[0].geometry.coordinates;
}

module.exports = { getRoute };