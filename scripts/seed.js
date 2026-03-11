// seed.js
// Run with: node scripts/seed.js
// This script will connect to MongoDB, clear relevant collections and insert
// at least 10 dummy documents for each of the main routes/models used in the
// application.  It uses @faker-js/faker for random data.  Adjust as needed.

const connectDB = require('../models/DBConfig');
const { User } = require('../models/user');
const { Trip } = require('../models/trip');
const { SOSNotification } = require('../models/sosNotification');
const { SafetyScore } = require('../models/safetyScore');
const { GeoFencing } = require('../models/geoFencing');
const { EmergencyNotification } = require('../models/emergencyNotification');
const { CurrentLocation } = require('../models/currentLocation');
const { EmergencyContact } = require('../models/emergencyContact');
const { Notification } = require('../models/notification');

const { faker } = require('@faker-js/faker');

async function createUsers(count = 10) {
  const users = [];
  for (let i = 0; i < count; i++) {
    const user = new User({
      fullName: faker.person.fullName(),
      phoneNumber: faker.phone.number('##########'),
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password(8),
      aadhaarNumber: faker.datatype.boolean() ? faker.string.numeric(12) : undefined
    });
    users.push(await user.save());
  }
  return users;
}

async function seed() {
  await connectDB();

  // wipe collections of interest
  await Promise.all([
    User.deleteMany({}),
    Trip.deleteMany({}),
    SOSNotification.deleteMany({}),
    SafetyScore.deleteMany({}),
    GeoFencing.deleteMany({}),
    EmergencyNotification.deleteMany({}),
    CurrentLocation.deleteMany({}),
    EmergencyContact.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const users = await createUsers(10);

  // create at least ten of each other model
  for (let i = 0; i < 10; i++) {
    const user = users[i % users.length];

    await Trip.create({
      userId: user._id,
      tripName: faker.lorem.words(3),
      startingLocation: faker.location.city(),
      endingLocation: faker.location.city(),
      startingDandT: faker.date.future().toISOString(),
      endingDandT: faker.date.future().toISOString(),
      intermediateStops: faker.location.city(),
      transportation: faker.helpers.arrayElement(['car','bus','train','plane']),
      hotelName: faker.company.companyName(),
      emergencyContact: faker.phone.number('##########'),
      contactName: faker.person.fullName(),
    });

    await SOSNotification.create({
      userId: user._id,
      currentLocation: faker.location.city(),
      latitude: parseFloat(faker.location.latitude()),
      longitude: parseFloat(faker.location.longitude()),
      status: faker.helpers.arrayElement(['pending','acknowledged','resolved']),
      message: faker.lorem.sentence(),
      acknowledgedAt: faker.date.recent(),
      resolvedAt: faker.date.recent(),
    });

    await SafetyScore.create({
      userId: user._id,
      safetyScore: faker.datatype.number({ min: 0, max: 100 }),
      lastUpdated: faker.date.recent(),
    });

    await GeoFencing.create({
      areaName: faker.location.city(),
      latitude: parseFloat(faker.location.latitude()),
      longitude: parseFloat(faker.location.longitude()),
      radius: faker.datatype.number({ min: 100, max: 5000 }),
      alertLevel: faker.helpers.arrayElement(['low','medium','high','critical']),
      description: faker.lorem.sentence(),
    });

    await EmergencyNotification.create({
      userId: user._id,
      currentLocation: faker.location.city(),
      latitude: parseFloat(faker.location.latitude()),
      longitude: parseFloat(faker.location.longitude()),
    });

    await CurrentLocation.create({
      userId: user._id,
      latitude: parseFloat(faker.location.latitude()),
      longitude: parseFloat(faker.location.longitude()),
      isDanger: faker.datatype.boolean(),
      dangerLevel: faker.helpers.arrayElement(['low','medium','high','critical']),
      city: faker.location.city(),
      state: faker.location.state(),
      updatedAt: faker.date.recent(),
    });

    await EmergencyContact.create({
      userId: user._id,
      contactName: faker.person.fullName(),
      contactPhone: faker.phone.number('##########'),
      relation: faker.helpers.arrayElement(['friend','family','other']),
    });

    await Notification.create({
      userId: user._id,
      content: faker.lorem.sentence(),
      level: faker.helpers.arrayElement(['info','warning','error','critical','success']),
    });
  }

  console.log('Seeding complete');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding error', err);
  process.exit(1);
});
