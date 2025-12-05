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

// ========== LAYANAN CRUD ==========

exports.createLayanan = async (req, res) => {
  try {
    const { nama, deskripsi, harga } = req.body;

    if (!nama || !harga) {
      return res.status(400).json({ message: "Nama dan harga wajib diisi" });
    }

    const [result] = await pool.query(
      "INSERT INTO layanan (nama, deskripsi, harga) VALUES (?, ?, ?)",
      [nama, deskripsi || "", harga]
    );

    res.status(201).json({
      id: result.insertId,
      nama,
      deskripsi: deskripsi || "",
      harga,
    });
  } catch (err) {
    console.error("Error createLayanan:", err);
    res.status(500).json({ message: "Gagal menambah layanan" });
  }
};

exports.updateLayanan = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, deskripsi, harga } = req.body;

    const [result] = await pool.query(
      "UPDATE layanan SET nama = ?, deskripsi = ?, harga = ? WHERE id = ?",
      [nama, deskripsi || "", harga, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Layanan tidak ditemukan" });
    }

    res.json({ id, nama, deskripsi: deskripsi || "", harga });
  } catch (err) {
    console.error("Error updateLayanan:", err);
    res.status(500).json({ message: "Gagal mengubah layanan" });
  }
};

exports.deleteLayanan = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM layanan WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Layanan tidak ditemukan" });
    }

    res.json({ message: "Layanan berhasil dihapus" });
  } catch (err) {
    console.error("Error deleteLayanan:", err);
    res.status(500).json({ message: "Gagal menghapus layanan" });
  }
};

// ========== PRODUK CRUD ==========

exports.createProduk = async (req, res) => {
  try {
    const { nama, deskripsi, harga } = req.body;

    if (!nama || !harga) {
      return res.status(400).json({ message: "Nama dan harga wajib diisi" });
    }

    const [result] = await pool.query(
      "INSERT INTO produk (nama, deskripsi, harga) VALUES (?, ?, ?)",
      [nama, deskripsi || "", harga]
    );

    res.status(201).json({
      id: result.insertId,
      nama,
      deskripsi: deskripsi || "",
      harga,
    });
  } catch (err) {
    console.error("Error createProduk:", err);
    res.status(500).json({ message: "Gagal menambah produk" });
  }
};

exports.updateProduk = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, deskripsi, harga } = req.body;

    const [result] = await pool.query(
      "UPDATE produk SET nama = ?, deskripsi = ?, harga = ? WHERE id = ?",
      [nama, deskripsi || "", harga, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    res.json({ id, nama, deskripsi: deskripsi || "", harga });
  } catch (err) {
    console.error("Error updateProduk:", err);
    res.status(500).json({ message: "Gagal mengubah produk" });
  }
};

exports.deleteProduk = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM produk WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    res.json({ message: "Produk berhasil dihapus" });
  } catch (err) {
    console.error("Error deleteProduk:", err);
    res.status(500).json({ message: "Gagal menghapus produk" });
  }
};
