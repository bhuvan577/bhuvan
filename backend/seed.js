/**
 * Simple seeder: loads sample_data/books.json into DB.
 * Usage:
 *   node seed.js
 * or npm run seed
 */
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Book = require("./models/Book");

dotenv.config();

const dataPath = path.join(__dirname, "sample_data", "books.json");
const books = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

(async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI missing in .env");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongo connected. Clearing Book collection…");
    await Book.deleteMany({});
    console.log("Inserting sample books…");
    await Book.insertMany(books);
    console.log("Done!");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
})();
