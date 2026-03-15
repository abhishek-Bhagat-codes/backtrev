require('dotenv').config({ quiet: true }); // Load environment variables from .env file

const express = require('express');
const app = express();
const connectDB = require('./models/DBConfig.js');
const userRouter = require('./routes/user.routes.js');
const tripRouter = require('./routes/trip.routes.js');
const emergencyNotificationRouter = require('./routes/emergencyNotification.routes.js');
const currentLocationRouter = require('./routes/currentLocation.routes.js');
const safetyScoreRouter = require('./routes/safetyScore.routes.js');
const geoFencingRouter = require('./routes/geoFencing.routes.js');
const sosNotificationRouter = require('./routes/sosNotification.routes.js');
const dashboardRouter = require('./routes/dashboard.routes');
const PORT = process.env.PORT || 3000;
const cors = require("cors");

//Handling cors policy issues
const corsOptions = {
    origin: "http://localhost:5173",
    methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
    credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json()); // Middleware to parse JSON bodies

// Routes
app.use('/api/users', userRouter);
app.use('/api/trips', tripRouter);
app.use('/api/emergency-notifications', emergencyNotificationRouter);
app.use('/api/current-location', currentLocationRouter);
app.use('/api/safety-score', safetyScoreRouter);
app.use('/api/geofencing', geoFencingRouter);
app.use('/api/sos-notifications', sosNotificationRouter);
app.use('/api/dashboard', dashboardRouter);


app.get('/', (req, res) => {
    res.send('Welcome to the SafeDrive API!');

});

// Start the server
connectDB().then(() => { // Ensure DB is connected before starting server
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.error('Failed to start server:', err);  
});
