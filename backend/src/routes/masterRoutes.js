const express = require("express");
const router = express.Router();
const masterController = require("../controllers/masterController");

router.get("/layanan", masterController.getLayanan);
router.get("/produk", masterController.getProduk);

module.exports = router;
