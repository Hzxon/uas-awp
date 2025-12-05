const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const itemRoutes = require("./routes/itemRoutes");
const { verifyToken } = require("./middleware/auth");
const pool = require("./config/db");

const PORT = process.env.PORT || 5001;
const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:4173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/orders", verifyToken, orderRoutes);
app.use("/api/items", itemRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", port: PORT });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
});

const startServer = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    app.listen(PORT, () => {
      console.log(`Server REAL running on http://localhost:${PORT}`);
      console.log("Database connected successfully");
    });
  } catch (err) {
    console.error("Database Connection Failed: ", err);
  }
};

startServer();
