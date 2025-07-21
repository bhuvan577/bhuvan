const express = require("express");
const Book = require("../models/Book");
const asyncHandler = require("../utils/asyncHandler");
const router = express.Router();

/**
 * GET /api/books?search=...
 * List all books OR filter by search (title or author, partial, case-insensitive)
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { search } = req.query;
    const query = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { author: { $regex: search, $options: "i" } },
          ],
        }
      : {};
    const books = await Book.find(query).sort({ createdAt: -1 });
    res.json(books);
  })
);

/**
 * GET /api/books/:id
 */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const book = await Book.findById(req.params.id);
    if (!book) {
      res.status(404);
      throw new Error("Book not found");
    }
    res.json(book);
  })
);

/**
 * POST /api/books
 * { title, author, year, genre? }
 */
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { title, author, year, genre } = req.body;
    if (!title || !author || !year) {
      res.status(400);
      throw new Error("title, author, and year are required");
    }
    const newBook = await Book.create({ title, author, year, genre });
    res.status(201).json(newBook);
  })
);

/**
 * PUT /api/books/:id
 */
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { title, author, year, genre } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) {
      res.status(404);
      throw new Error("Book not found");
    }
    if (title !== undefined) book.title = title;
    if (author !== undefined) book.author = author;
    if (year !== undefined) book.year = year;
    if (genre !== undefined) book.genre = genre;
    const updated = await book.save();
    res.json(updated);
  })
);

/**
 * DELETE /api/books/:id
 */
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const book = await Book.findById(req.params.id);
    if (!book) {
      res.status(404);
      throw new Error("Book not found");
    }
    await book.deleteOne();
    res.json({ message: "Book deleted", id: req.params.id });
  })
);

module.exports = router;
