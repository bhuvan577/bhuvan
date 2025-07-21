const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    genre: { type: String, trim: true },
    // Optional: track copies later if you extend
    // copiesTotal: { type: Number, default: 1 },
    // copiesAvailable: { type: Number, default: 1 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
