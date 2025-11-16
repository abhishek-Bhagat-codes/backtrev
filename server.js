const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./models/DBConfig.js');
const userRouter = require('./routes/user.routes.js');
const tripRouter = require('./routes/trip.routes.js');
const emergencyNotificationRouter = require('./routes/emergencyNotification.routes.js');
const currentLocationRouter = require('./routes/currentLocation.routes.js');
const safetyScoreRouter = require('./routes/safetyScore.routes.js');
const geoFencingRouter = require('./routes/geoFencing.routes.js');
const sosNotificationRouter = require('./routes/sosNotification.routes.js');
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();


const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/users', userRouter);
app.use('/api/trips', tripRouter);
app.use('/api/emergency-notifications', emergencyNotificationRouter);
app.use('/api/current-location', currentLocationRouter);
app.use('/api/safety-score', safetyScoreRouter);
app.use('/api/geofencing', geoFencingRouter);
app.use('/api/sos-notifications', sosNotificationRouter);



app.listen(PORT,()=>{
    console.log(PORT);
})
