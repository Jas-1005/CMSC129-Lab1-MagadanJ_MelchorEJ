const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 280,
    },
    countryCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      maxlength: 4,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = itemSchema;
