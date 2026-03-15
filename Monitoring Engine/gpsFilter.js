let lastPoint = null;

function smoothLocation(newPoint){

if(!lastPoint){
lastPoint = newPoint;
return newPoint;
}

const alpha = 0.6;

const smoothed = {
lat: alpha * newPoint.lat + (1-alpha) * lastPoint.lat,
lng: alpha * newPoint.lng + (1-alpha) * lastPoint.lng
};

lastPoint = smoothed;

return smoothed;

}

module.exports = { smoothLocation };