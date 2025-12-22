const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const itemRoutes = require("./routes/itemRoutes");
const { verifyToken } = require("./middleware/auth");
const pool = require("./config/db");
const masterRoutes = require("./routes/masterRoutes");
const addressRoutes = require("./routes/addressRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const outletRoutes = require("./routes/outletRoutes");
const statusRoutes = require("./routes/statusRoutes");
const outletAdminRoutes = require("./routes/outletAdminRoutes");
const partnerRoutes = require("./routes/partnerRoutes");
const adminPartnerRoutes = require("./routes/adminPartnerRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

// Penting: gunakan Port 5001 karena 5000 bermasalah di Mac
const PORT = process.env.PORT || 5001;
const app = express();

// --- CONFIG CORS FINAL (YANG TERBUKTI BERHASIL) ---
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:4173"], // Whitelist frontend
  credentials: true, // Wajib agar cookie/session jalan
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(express.json());

// Main Routes
app.use("/api/auth", authRoutes); // Di sini route /me dan /login yang asli berada
app.use("/api/orders", verifyToken, orderRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/masters", masterRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/outlets", outletRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/outlets/admin", outletAdminRoutes);

// New marketplace routes
app.use("/api/partner", partnerRoutes);
app.use("/api/admin/partners", adminPartnerRoutes);
app.use("/api/reviews", reviewRoutes);

// Outlet items routes
const outletItemRoutes = require("./routes/outletItemRoutes");
app.use("/api/outlet-items", outletItemRoutes);

// Admin analytics routes
const adminAnalyticsRoutes = require("./routes/adminAnalyticsRoutes");
app.use("/api/admin/analytics", adminAnalyticsRoutes);

// Tes
app.get("/", (req, res) => res.send("Backend OK"));

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
  // 1. Nyalakan server dulu
  app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  });

  // 2. Baru coba konek DB (hanya untuk info)
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Database Connection Failed: ", err);
    // JANGAN process.exit atau throw;
    // biarkan server tetap hidup untuk terima request.
  }
};

startServer();
