const dotenv = require("dotenv");
dotenv.config(); // ⬅️ load .env PALING AWAL

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const itemRoutes = require("./routes/itemRoutes");
const { verifyToken } = require("./middleware/auth");
const pool = require("./config/db");

const PORT = process.env.PORT || 5000;
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
app.use("/api/items", itemRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
});

const startServer = async () => {
    try {
        const connection = await pool.getConnection(); 
        await connection.ping(); 
        connection.release(); 
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`); 
            console.log("Connected to the database successfully");
        });
    } catch (err) {
        console.error("Unable to connect to the database: ", err);
        process.exit(1);
    }
};

startServer(); 