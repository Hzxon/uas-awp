const pool = require("../config/db");

// Create address book entry
exports.createAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { label, nama_penerima, phone, alamat, catatan, is_default, lat, lng } = req.body;

    if (!alamat || !nama_penerima) {
      return res.status(400).json({ success: false, message: "Nama penerima dan alamat wajib diisi" });
    }
    if (String(alamat).length > 500) {
      return res.status(400).json({ success: false, message: "Alamat terlalu panjang" });
    }
    if (phone && String(phone).length > 50) {
      return res.status(400).json({ success: false, message: "No. telepon terlalu panjang" });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // If this should be default, unset other defaults
      if (is_default) {
        await connection.query("UPDATE addresses SET is_default = 0 WHERE user_id = ?", [userId]);
      }

      const [result] = await connection.query(
        "INSERT INTO addresses (user_id, label, nama_penerima, phone, alamat, catatan, is_default, lat, lng, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
        [userId, label || "Utama", nama_penerima, phone || "", alamat, catatan || "", is_default ? 1 : 0, lat || null, lng || null]
      );

      await connection.commit();

      return res.status(201).json({
        success: true,
        address: {
          id: result.insertId,
          user_id: userId,
          label: label || "Utama",
          nama_penerima,
          phone: phone || "",
          alamat,
          catatan: catatan || "",
          is_default: is_default ? 1 : 0,
        },
      });
    } catch (err) {
      await connection.rollback();
      console.error("Create address error:", err);
      return res.status(500).json({ success: false, message: "Gagal menyimpan alamat" });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("System error createAddress:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// List addresses for user
exports.listAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      "SELECT id, label, nama_penerima, phone, alamat, catatan, is_default FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC",
      [userId]
    );
    return res.json({ success: true, addresses: rows });
  } catch (err) {
    console.error("List addresses error:", err);
    return res.status(500).json({ success: false, message: "Gagal mengambil alamat" });
  }
};

// Update address
exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    const { label, nama_penerima, phone, alamat, catatan, is_default, lat, lng } = req.body;

    if (!alamat || !nama_penerima) {
      return res.status(400).json({ success: false, message: "Nama penerima dan alamat wajib diisi" });
    }
    if (String(alamat).length > 500) {
      return res.status(400).json({ success: false, message: "Alamat terlalu panjang" });
    }
    if (phone && String(phone).length > 50) {
      return res.status(400).json({ success: false, message: "No. telepon terlalu panjang" });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      if (is_default) {
        await connection.query("UPDATE addresses SET is_default = 0 WHERE user_id = ?", [userId]);
      }

      const [result] = await connection.query(
        "UPDATE addresses SET label = ?, nama_penerima = ?, phone = ?, alamat = ?, catatan = ?, is_default = ?, lat = ?, lng = ? WHERE id = ? AND user_id = ?",
        [label || "Utama", nama_penerima || "", phone || "", alamat || "", catatan || "", is_default ? 1 : 0, lat || null, lng || null, addressId, userId]
      );

      await connection.commit();

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Alamat tidak ditemukan" });
      }

      return res.json({ success: true, message: "Alamat diperbarui" });
    } catch (err) {
      await connection.rollback();
      console.error("Update address error:", err);
      return res.status(500).json({ success: false, message: "Gagal memperbarui alamat" });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("System error updateAddress:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    const [result] = await pool.query("DELETE FROM addresses WHERE id = ? AND user_id = ?", [addressId, userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Alamat tidak ditemukan" });
    }
    return res.json({ success: true, message: "Alamat dihapus" });
  } catch (err) {
    console.error("Delete address error:", err);
    return res.status(500).json({ success: false, message: "Gagal menghapus alamat" });
  }
};
