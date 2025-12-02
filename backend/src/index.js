const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const { verifyToken } = require("./middleware/auth");
const pool = require("./config/db");

const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: process.env.FRONTEND_ORIGIN || "*",
    })
  );
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/db-test", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT 1 AS result");
      res.json({ success: true, rows });
    } catch (err) {
      console.error("DB TEST ERROR:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/orders", verifyToken, orderRoutes);

  app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
  });

  app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  });

  return app;
};

module.exports = { createApp };
