const express = require("express");
const mongoose = require("mongoose");

module.exports = (PrimaryItem, BackupItem) => {
  const router = express.Router();
  const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

  //POST /api/messages
  router.post("/", async (req, res) => {
    try {
      const { message, countryCode } = req.body;
      const created = await Item.create({ message, countryCode });

      await BackupItem.findByIdAndUpdate(
        created._id,
        { message, countryCode },
        { upsert: true, new: true, runValidators: true }
      );

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
            if (!isValidId(id)) {
                return res.status(400).json({ error: "Invalid ID format" });
                const item = await Item.findById(id);
                if (!item) {
                    return res.status(404).json({ error: "Message not found" });
                }
                res.json(item);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    //UPDATE
    //PUT /api/messages/:id
    router.put("/:id", async (req, res) => {
        try {
            const { id } = req.params;
            if (!isValidId(id)) {
                return res.status(400).json({ error: "Invalid ID format" });
            }
            const updated = await PrimaryItem.findByIdAndUpdate(id, 
                { message: req.body.message, countryCode: req.body.countryCode },
                { new: true, runValidators: true }
            );
            if (!updated) {
                return res.status(404).json({ error: "Message not found" });
            }
            await BackupItem.findByIdAndUpdate(
                updated._id,
                updated.toObject(),
                { upsert: true, new: true, runValidators: true }
            );
            res.json(updated);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    //soft delete
    // DELETE /api/messages/:id
    router.delete("/:id", async (req, res) => {
        try {
            const { id } = req.params;
            if (!isValidId(id)) {
                return res.status(400).json({ error: "Invalid ID format" });
            }
            const deleted = await PrimaryItem.findByIdAndUpdate(
                id,
                { isDeleted: true, deletedAt: new Date() },
                { new: true }
            );
            if (!deleted) {
                return res.status(404).json({ error: "Message not found" });
            }

            await BackupItem.findByIdAndUpdate(
                deleted._id,
                deleted.toObject(),
                { upsert: true, new: true, setDefaultOnInsert: true }
            );
            res.json({ message: "Soft deleted", data: deleted });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    //PATCH /api/messages/:id/restore
    router.patch("/:id/restore", async (req, res) => {
        try {
            const restored = await PrimaryItem.findByIdAndUpdate(
                req.params.id,
                { isDeleted: false, deletedAt: null },
                { new: true }
            );
            if (!restored) {
                return res.status(404).json({ error: "Message not found" });
            }
            await BackupItem.findByIdAndUpdate(
                restored._id,
                restored.toObject(),
                { upsert: true, new: true, setDefaultOnInsert: true }
            );
            res.json({ message: "Message restored", data: restored });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // hard delete
    // DELETE /api/messages/:id/hard
    router.delete("/:id/hard", async (req, res) => {
        try {
            await PrimaryItem.findByIdAndDelete(req.params.id);
            await BackupItem.findByIdAndDelete(req.params.id);
            res.json({ message: "Message permanently deleted" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
};