const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connection = await mongoose.createConnection(process.env.MONGODB_URI).asPromise();
    console.log("MongoDB connected");
    return connection;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
