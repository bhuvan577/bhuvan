const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();
connectDB(); // connects to MongoDB

const app = express();

// CORS
const corsOrigin = process.env.CORS_ORIGIN || "*";
app.use(cors({ origin: corsOrigin.split(",").map((s) => s.trim()) }));

// Body parser
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Library API running");
});

// Routes
app.use("/api/books", require("./routes/bookRoutes"));

// 404 + error handlers
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
