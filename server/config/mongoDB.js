const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const primary = await mongoose.createConnection
     (process.env.MONGODB_URI).asPromise(); {
      console.log("Primary MongoDB Atlas connected")
    };
    const backup = await mongoose.createConnection
    (process.env.MONGODB_URI).asPromise(); {
      console.log("Backup MongoDB Atlas connected")
    }
    return {primary, backup};
  } catch (error) {
    console.error("MongoDB Atlas connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;