require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Destination = require('../models/Destination');
const Trip = require('../models/Trip');
const Group = require('../models/Group');
const Post = require('../models/Post');
const { memoryDestinations } = require('../controllers/destinationController');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/wanderlust';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    await User.deleteMany();
    await Destination.deleteMany();
    await Trip.deleteMany();
    await Group.deleteMany();
    await Post.deleteMany();

    // Create Admin User & Demo Users
    const admin = await User.create({
      name: 'WanderLust Admin',
      email: 'admin@wanderlust.com',
      password: 'admin123',
      role: 'admin',
      bio: 'Platform administrator and lead travel curator.',
    });

    const user1 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@wanderlust.com',
      password: 'password123',
      location: 'Mumbai',
      interests: ['Trekking', 'Photography', 'Scuba Diving'],
    });

    const user2 = await User.create({
      name: 'Sneha Patel',
      email: 'sneha@wanderlust.com',
      password: 'password123',
      location: 'Ahmedabad',
      interests: ['Beaches', 'Culture', 'Foodie'],
    });

    // Seed Destinations
    const formattedDestinations = memoryDestinations.map(({ _id, ...rest }) => rest);
    await Destination.insertMany(formattedDestinations);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.warn('Seeding warning (MongoDB server may be offline):', error.message);
    console.log('In-Memory fallback data will automatically be served during API requests.');
    process.exit(0);
  }
};

seedDatabase();
