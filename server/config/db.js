const mongoose = require('mongoose');

let isInMemoryFallback = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/wanderlust', {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    isInMemoryFallback = false;
  } catch (error) {
    console.warn(`MongoDB Connection Warning: ${error.message}`);
    console.log('Running WanderLust with In-Memory Storage Fallback mode for seamless local operation.');
    isInMemoryFallback = true;
  }
};

const getFallbackStatus = () => isInMemoryFallback;

module.exports = { connectDB, getFallbackStatus };
