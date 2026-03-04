const { User } = require('../models/user.js');
const { Trip } = require('../models/trip.js');
const { CurrentLocation } = require('../models/currentLocation.js');
const { SafetyScore } = require('../models/safetyScore.js');
const { SOSNotification } = require('../models/sosNotification.js');
const { EmergencyNotification } = require('../models/emergencyNotification.js');
const { GeoFencing } = require('../models/geoFencing.js');

// Map backend status to frontend status
const mapSOSStatusToFrontend = (status) => {
    const map = { pending: 'active', acknowledged: 'acknowledged', resolved: 'dispatched' };
    return map[status] || status;
};

module.exports = {
    // ------------------------------------
    //  FETCH ALL TOURISTS (Dashboard view)
    // ------------------------------------
    fetchTourists: async (req, res) => {
        try {
            const users = await User.find().select('-password').sort({ createdAt: -1 }); //get all users without password and sort by newest first
            const tourists = [];

            for (const user of users) {
                const [latestTrip, location, safetyScore, recentSOS] = await Promise.all([
                    Trip.findOne({ userId: user._id }).sort({ createdAt: -1 }),
                    CurrentLocation.findOne({ userId: user._id }),
                    SafetyScore.findOne({ userId: user._id }),
                    SOSNotification.findOne({ userId: user._id, status: 'pending' })
                ]);

                //if trip has intermediate stops, show them in itinerary, else show starting and ending location, else show no itinerary
                const itinerary = latestTrip?.intermediateStops     
                    ? latestTrip.intermediateStops
                    : latestTrip
                        ? [latestTrip.startingLocation, latestTrip.endingLocation].filter(Boolean).join(' → ')
                        : 'No itinerary';

                let status = 'safe';

                if (recentSOS) 
                    status = 'sos';
                else if (safetyScore && safetyScore.safetyScore < 70) 
                    status = 'warning';

                const lastLocationUpdate = location?.updatedAt || location?.createdAt;
                const lastSeen = lastLocationUpdate || user.createdAt;

                tourists.push({
                    id: user._id.toString(),
                    name: user.fullName,
                    itinerary,
                    status,
                    active: safetyScore ? safetyScore.safetyScore >= 50 : true,
                    gender: 'other',
                    lastSeen: lastSeen ? new Date(lastSeen).toISOString() : new Date().toISOString(),
                    photoUrl: '',
                    emergencyContacts: latestTrip ? [{ name: latestTrip.contactName || 'Contact', phone: latestTrip.emergencyContact || '' }] : [],
                    emergencyContact: latestTrip?.emergencyContact || '',
                    location: location ? { lat: location.latitude, lng: location.longitude } : { lat: 28.6139, lng: 77.209 }
                });
            }

            return res.json({ tourists });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // ------------------------------------
    //  FETCH ALL ALERTS (SOS + Emergency/Geofence)
    // ------------------------------------
    fetchAlerts: async (req, res) => {
        try {
            const [sosList, emergencyList] = await Promise.all([
                SOSNotification.find().sort({ createdAt: -1 }).populate('userId', 'fullName'), 
                EmergencyNotification.find().sort({ createdAt: -1 }).populate('userId', 'fullName')
            ]);

            const alerts = [];

            sosList.forEach((s) => {
                const uid = s.userId?._id || s.userId;
                alerts.push({
                    id: `SOS-${s._id}`,
                    _backendId: s._id.toString(),
                    _type: 'SOS',
                    name: s.userId?.fullName || 'Unknown',
                    type: 'SOS',
                    status: mapSOSStatusToFrontend(s.status),
                    touristId: uid ? String(uid) : '',
                    time: new Date(s.createdAt).toLocaleString()
                });
            });

            emergencyList.forEach((e) => {
                const uid = e.userId?._id || e.userId;
                alerts.push({
                    id: `GEO-${e._id}`,
                    _backendId: e._id.toString(),
                    _type: 'Geo-fence',
                    name: e.userId?.fullName || 'Unknown',
                    type: 'Geo-fence',
                    status: 'acknowledged',
                    touristId: uid ? String(uid) : '',
                    time: new Date(e.createdAt).toLocaleString()
                });
            });

            //Latest alerts first
            alerts.sort((a, b) => new Date(b.time) - new Date(a.time)); 

            return res.json({ alerts });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // ------------------------------------
    //  FETCH ALL ZONES (Geofences)
    // ------------------------------------
    fetchZones: async (req, res) => {
        try {
            const geofences = await GeoFencing.find().sort({ createdAt: -1 });
            const zones = geofences.map((g) => ({
                id: g._id.toString(),
                name: g.areaName,
                risk: g.alertLevel ? g.alertLevel.charAt(0).toUpperCase() + g.alertLevel.slice(1) : 'Medium', //1st char uppercase 
                location: { lat: g.latitude, lng: g.longitude }
            }));
            return res.json({ zones });
        } catch (err) {
            console.error(err); 
            res.status(500).json({ message: 'Server error' });
        }
    }
};
