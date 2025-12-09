const pool = require("../config/db");

exports.listPublic = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nama, alamat, lat, lng, coverage_radius_km, biaya_per_km, min_biaya, jam_operasional FROM outlets WHERE is_active = 1 ORDER BY id DESC"
    );
    return res.json({ success: true, outlets: rows });
  } catch (err) {
    console.error("listPublic outlets error:", err);
    return res.status(500).json({ success: false, message: "Gagal mengambil data outlet" });
  }
};

exports.listAdmin = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nama, alamat, lat, lng, coverage_radius_km, biaya_per_km, min_biaya, jam_operasional, is_active FROM outlets ORDER BY id DESC"
    );
    return res.json({ success: true, outlets: rows });
  } catch (err) {
    console.error("listAdmin outlets error:", err);
    return res.status(500).json({ success: false, message: "Gagal mengambil data outlet" });
  }
};

exports.create = async (req, res) => {
  try {
    const { nama, alamat, lat, lng, coverage_radius_km, biaya_per_km, min_biaya, jam_operasional, is_active } =
      req.body;
    if (!nama || !alamat || lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: "Nama, alamat, lat, lng wajib diisi" });
    }
    await pool.query(
      "INSERT INTO outlets (nama, alamat, lat, lng, coverage_radius_km, biaya_per_km, min_biaya, jam_operasional, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
      [
        nama,
        alamat,
        lat,
        lng,
        coverage_radius_km || 5,
        biaya_per_km || 0,
        min_biaya || 0,
        jam_operasional || "",
        is_active ? 1 : 0,
      ]
    );
    return res.status(201).json({ success: true, message: "Outlet berhasil dibuat" });
  } catch (err) {
    console.error("create outlet error:", err);
    return res.status(500).json({ success: false, message: "Gagal membuat outlet" });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { nama, alamat, lat, lng, coverage_radius_km, biaya_per_km, min_biaya, jam_operasional, is_active } =
      req.body;

    const [result] = await pool.query(
      "UPDATE outlets SET nama = ?, alamat = ?, lat = ?, lng = ?, coverage_radius_km = ?, biaya_per_km = ?, min_biaya = ?, jam_operasional = ?, is_active = ? WHERE id = ?",
      [
        nama,
        alamat,
        lat,
        lng,
        coverage_radius_km || 5,
        biaya_per_km || 0,
        min_biaya || 0,
        jam_operasional || "",
        is_active ? 1 : 0,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Outlet tidak ditemukan" });
    }

    return res.json({ success: true, message: "Outlet diperbarui" });
  } catch (err) {
    console.error("update outlet error:", err);
    return res.status(500).json({ success: false, message: "Gagal memperbarui outlet" });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    const [result] = await pool.query("DELETE FROM outlets WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Outlet tidak ditemukan" });
    }
    return res.json({ success: true, message: "Outlet dihapus" });
  } catch (err) {
    console.error("remove outlet error:", err);
    return res.status(500).json({ success: false, message: "Gagal menghapus outlet" });
  }
};
