const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Just pass the URI, no extra options needed in Mongoose 6+
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
