const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URL || process.env.MONGO_URI;
    if (!connStr) {
      console.error('Error: MONGO_URL environment variable is not defined.');
      process.exit(1);
    }
    
    await mongoose.connect(connStr);
    console.log('MongoDB Atlas Connected successfully');
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
