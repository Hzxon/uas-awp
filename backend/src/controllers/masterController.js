const pool = require("../config/db");

exports.getLayanan = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nama, deskripsi, harga FROM layanan"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error getLayanan:", err);
    res.status(500).json({ message: "Gagal mengambil data layanan" });
  }
};


exports.getProduk = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nama, deskripsi, harga FROM produk"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error getProduk:", err);
    res.status(500).json({ message: "Gagal mengambil data produk" });
  }
};
