const express = require("express");
const router = express.Router();
const { verifyToken, requireAdmin } = require("../middleware/auth");
const { getLayanan, createLayanan, updateLayanan, deleteLayanan, getProduk, createProduk, updateProduk, deleteProduk } = require("../controllers/masterController");

// LAYANAN
router.get("/layanan", getLayanan);
router.post("/layanan", verifyToken, requireAdmin, createLayanan);
router.put("/layanan/:id", verifyToken, requireAdmin, updateLayanan);
router.delete("/layanan/:id", verifyToken, requireAdmin, deleteLayanan);

// PRODUK
router.get("/produk", getProduk);
router.post("/produk", verifyToken, requireAdmin, createProduk);
router.put("/produk/:id", verifyToken, requireAdmin, updateProduk);
router.delete("/produk/:id", verifyToken, requireAdmin, deleteProduk);

module.exports = router;
