const express = require("express");
const router = express.Router();
const { getLayanan, createLayanan, updateLayanan, deleteLayanan, getProduk, createProduk, updateProduk, deleteProduk } = require("../controllers/masterController");

// LAYANAN
router.get("/layanan", getLayanan);
router.post("/layanan", createLayanan);
router.put("/layanan/:id", updateLayanan);
router.delete("/layanan/:id", deleteLayanan);

// PRODUK
router.get("/produk", getProduk);
router.post("/produk", createProduk);
router.put("/produk/:id", updateProduk);
router.delete("/produk/:id", deleteProduk);

module.exports = router;
