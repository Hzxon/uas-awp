const express = require("express");
const { signup, login, me } = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");
const rateLimit = require("express-rate-limit");
const router = require("express").Router(); 

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP
  message: { success: false, message: "Terlalu banyak percobaan. Coba lagi nanti." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use("/login", authLimiter);
router.use("/signup", authLimiter);

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", verifyToken, me);

module.exports = router;
