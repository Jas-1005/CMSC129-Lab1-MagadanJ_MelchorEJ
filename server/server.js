// START HERE
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/mongoDB");
const createItemModel = require("./models/item");
const createMessageRoutes = require("./routes/messages");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const startServer = async () => {
  try {
    const connection = await connectDB();
    const Item = createItemModel(connection);
    const messageRoutes = createMessageRoutes(Item);
    app.use("/api/messages", messageRoutes);

    app.get("/", (_, res) => {
      res.json({ ok: true, message: "Welcome to the Anon API" });
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
};

startServer();