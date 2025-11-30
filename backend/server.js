const express = require("express");
const cors = require("cors");
require("dotenv").config();

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
