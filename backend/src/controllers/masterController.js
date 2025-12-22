const pool = require("../config/db");
const { logAudit } = require("../utils/audit");

exports.getLayanan = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nama, deskripsi, harga, image FROM layanan"
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
      "SELECT id, nama, deskripsi, harga, image FROM produk"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error getProduk:", err);
    res.status(500).json({ message: "Gagal mengambil data produk" });
  }
};


// Verfiy akun (hanya admin yang bisa CRUD) 
const isAdmin = async (req, res) => {
  const userId = req.params.id;

  const sql = "SELECT * from `Users` WHERE id = userId";

  res.status(200).json({ message: "OK" });
}

// ========== LAYANAN CRUD ==========
exports.createLayanan = async (req, res) => {
  try {
    const { nama, deskripsi, harga, image } = req.body;

    if (!nama || !harga) {
      return res.status(400).json({ message: "Nama dan harga wajib diisi" });
    }

    const [result] = await pool.query(
      "INSERT INTO layanan (nama, deskripsi, harga, image) VALUES (?, ?, ?, ?)",
      [nama, deskripsi || "", harga, image || ""]
    );

    res.status(201).json({
      id: result.insertId,
      nama,
      deskripsi: deskripsi || "",
      harga,
      image: image || "",
    });
    await logAudit({
      actorId: req.user?.id,
      action: "create",
      targetType: "layanan",
      targetId: result.insertId,
      meta: { nama, harga, hasImage: Boolean(image) },
    });
  } catch (err) {
    console.error("Error createLayanan:", err);
    res.status(500).json({ message: "Gagal menambah layanan" });
  }
};

exports.updateLayanan = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, deskripsi, harga, image } = req.body;

    const [result] = await pool.query(
      "UPDATE layanan SET nama = ?, deskripsi = ?, harga = ?, image = ? WHERE id = ?",
      [nama, deskripsi || "", harga, image || "", id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Layanan tidak ditemukan" });
    }

    res.json({ id, nama, deskripsi: deskripsi || "", harga, image: image || "" });
    await logAudit({
      actorId: req.user?.id,
      action: "update",
      targetType: "layanan",
      targetId: id,
      meta: { nama, harga, hasImage: Boolean(image) },
    });
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
    await logAudit({
      actorId: req.user?.id,
      action: "delete",
      targetType: "layanan",
      targetId: id,
    });
  } catch (err) {
    console.error("Error deleteLayanan:", err);
    // Handle foreign key constraint error
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
      return res.status(400).json({
        message: "Layanan tidak dapat dihapus karena sudah digunakan dalam pesanan. Silakan arsipkan layanan ini atau hapus pesanan terkait terlebih dahulu."
      });
    }
    res.status(500).json({ message: "Gagal menghapus layanan" });
  }
};

// ========== PRODUK CRUD ==========

exports.createProduk = async (req, res) => {
  try {
    const { nama, deskripsi, harga, image } = req.body;

    if (!nama || !harga) {
      return res.status(400).json({ message: "Nama dan harga wajib diisi" });
    }

    const [result] = await pool.query(
      "INSERT INTO produk (nama, deskripsi, harga, image) VALUES (?, ?, ?, ?)",
      [nama, deskripsi || "", harga, image || ""]
    );

    res.status(201).json({
      id: result.insertId,
      nama,
      deskripsi: deskripsi || "",
      harga,
      image: image || "",
    });
    await logAudit({
      actorId: req.user?.id,
      action: "create",
      targetType: "produk",
      targetId: result.insertId,
      meta: { nama, harga, hasImage: Boolean(image) },
    });
  } catch (err) {
    console.error("Error createProduk:", err);
    res.status(500).json({ message: "Gagal menambah produk" });
  }
};

exports.updateProduk = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, deskripsi, harga, image } = req.body;

    const [result] = await pool.query(
      "UPDATE produk SET nama = ?, deskripsi = ?, harga = ?, image = ? WHERE id = ?",
      [nama, deskripsi || "", harga, image || "", id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    res.json({ id, nama, deskripsi: deskripsi || "", harga, image: image || "" });
    await logAudit({
      actorId: req.user?.id,
      action: "update",
      targetType: "produk",
      targetId: id,
      meta: { nama, harga, hasImage: Boolean(image) },
    });
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
    await logAudit({
      actorId: req.user?.id,
      action: "delete",
      targetType: "produk",
      targetId: id,
    });
  } catch (err) {
    console.error("Error deleteProduk:", err);
    // Handle foreign key constraint error
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
      return res.status(400).json({
        message: "Produk tidak dapat dihapus karena sudah digunakan dalam pesanan. Silakan arsipkan produk ini atau hapus pesanan terkait terlebih dahulu."
      });
    }
    res.status(500).json({ message: "Gagal menghapus produk" });
  }
};
