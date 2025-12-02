const pool = require("../config/db");

const ALLOWED_TYPES = ["Layanan", "Produk"];

const normalizePayload = (body) => ({
  name: body.name?.trim(),
  type: body.type,
  price: Number(body.price),
  unit: body.unit?.trim(),
  description: body.description?.trim() || null,
  is_active: body.is_active === 0 || body.is_active === false ? 0 : 1,
});

exports.listItems = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, type, price, unit, description, is_active AS isActive, created_at AS createdAt, updated_at AS updatedAt FROM items ORDER BY id DESC"
    );
    return res.json({ success: true, items: rows });
  } catch (err) {
    console.error("List items error:", err);
    return res.status(500).json({ success: false, message: "Gagal mengambil data items" });
  }
};

exports.getItem = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, type, price, unit, description, is_active AS isActive, created_at AS createdAt, updated_at AS updatedAt FROM items WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Item tidak ditemukan" });
    }
    return res.json({ success: true, item: rows[0] });
  } catch (err) {
    console.error("Get item error:", err);
    return res.status(500).json({ success: false, message: "Gagal mengambil item" });
  }
};

exports.createItem = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);

    if (!payload.name || !payload.unit || !ALLOWED_TYPES.includes(payload.type)) {
      return res.status(400).json({ success: false, message: "name, type, unit wajib diisi" });
    }

    if (!Number.isFinite(payload.price) || payload.price <= 0) {
      return res.status(400).json({ success: false, message: "price harus lebih dari 0" });
    }

    const [result] = await pool.query(
      "INSERT INTO items (name, type, price, unit, description, is_active) VALUES (?, ?, ?, ?, ?, ?)",
      [payload.name, payload.type, payload.price, payload.unit, payload.description, payload.is_active]
    );

    return res.status(201).json({
      success: true,
      message: "Item berhasil dibuat",
      id: result.insertId,
    });
  } catch (err) {
    console.error("Create item error:", err);
    return res.status(500).json({ success: false, message: "Gagal membuat item" });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);

    if (payload.type && !ALLOWED_TYPES.includes(payload.type)) {
      return res.status(400).json({ success: false, message: "type harus Layanan atau Produk" });
    }

    if (payload.price !== undefined && (!Number.isFinite(payload.price) || payload.price <= 0)) {
      return res.status(400).json({ success: false, message: "price harus lebih dari 0" });
    }

    const [result] = await pool.query(
      "UPDATE items SET name = COALESCE(?, name), type = COALESCE(?, type), price = COALESCE(?, price), unit = COALESCE(?, unit), description = COALESCE(?, description), is_active = COALESCE(?, is_active) WHERE id = ?",
      [
        payload.name || null,
        payload.type || null,
        payload.price || null,
        payload.unit || null,
        payload.description,
        payload.is_active,
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Item tidak ditemukan" });
    }

    return res.json({ success: true, message: "Item berhasil diupdate" });
  } catch (err) {
    console.error("Update item error:", err);
    return res.status(500).json({ success: false, message: "Gagal mengupdate item" });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM items WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Item tidak ditemukan" });
    }
    return res.json({ success: true, message: "Item berhasil dihapus" });
  } catch (err) {
    console.error("Delete item error:", err);
    return res.status(500).json({ success: false, message: "Gagal menghapus item" });
  }
};
