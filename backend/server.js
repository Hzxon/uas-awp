const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./src/config/db");

const authRoutes = require("./src/routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: "*", // nanti bisa dibatasi ke http://localhost:5173
  })
);

app.use(express.json());

app.get("/api/db-test", async (req, res) => {
  try {
    console.log("DB_USER ENV =", process.env.DB_USER);  // <-- TAMBAH INI

    const [rows] = await pool.query("SELECT 1 AS result");
    res.json({ success: true, rows });
  } catch (err) {
    console.error("DB TEST ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// cek server hidup
app.get("/api/health", (req, res) => {
  console.log("KENA /api/health");
  res.json({ status: "ok" });
});

// route signup & (nanti) login
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
