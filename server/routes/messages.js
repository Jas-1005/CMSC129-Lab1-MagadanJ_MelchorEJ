const express = require("express");
const mongoose = require("mongoose");

module.exports = (Item) => {
  const router = express.Router();
  const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

  // POST /api/messages
  router.post("/", async (req, res) => {
    try {
      const { message, countryCode } = req.body;
      const created = await Item.create({ message, countryCode });
      res.status(201).json(created);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // GET /api/messages?includeDeleted=false
  router.get("/", async (req, res) => {
    try {
      const includeDeleted = req.query.includeDeleted === "true";
      const filter = includeDeleted ? {} : { isDeleted: false };
      const items = await Item.find(filter).sort({ createdAt: -1 });
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/messages/:id
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID" });

      const item = await Item.findById(id);
      if (!item) return res.status(404).json({ error: "Message not found" });

      res.json(item);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/messages/:id
  router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID" });

      const { message, countryCode } = req.body;
      const updated = await Item.findByIdAndUpdate(
        id,
        { message, countryCode },
        { new: true, runValidators: true }
      );

      if (!updated) return res.status(404).json({ error: "Message not found" });
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  // soft delete
  // DELETE /api/messages/:id
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID" });

      const deleted = await Item.findByIdAndUpdate(
        id,
        { isDeleted: true, deletedAt: new Date() },
        { new: true }
      );

      if (!deleted) return res.status(404).json({ error: "Message not found" });
      res.json({ message: "Soft deleted", data: deleted });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  // restore
  // PATCH /api/messages/:id/restore
  router.patch("/:id/restore", async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID" });

      const restored = await Item.findByIdAndUpdate(
        id,
        { isDeleted: false, deletedAt: null },
        { new: true }
      );

      if (!restored) return res.status(404).json({ error: "Message not found" });
      res.json({ message: "Restored", data: restored });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  // hard delete
  // DELETE /api/messages/:id/hard
  router.delete("/:id/hard", async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID" });

      const removed = await Item.findByIdAndDelete(id);
      if (!removed) return res.status(404).json({ error: "Message not found" });

      res.json({ message: "Hard deleted" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
