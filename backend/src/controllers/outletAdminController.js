const pool = require("../config/db");

exports.listForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      "SELECT id, nama, alamat, lat, lng, coverage_radius_km, biaya_per_km, min_biaya, jam_operasional, is_active FROM outlets WHERE admin_user_id = ?",
      [userId]
    );
    return res.json({ success: true, outlets: rows });
  } catch (err) {
    console.error("listForUser error:", err);
    return res.status(500).json({ success: false, message: "Gagal mengambil outlet admin" });
  }
};

exports.updateForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;
    const { nama, alamat, lat, lng, coverage_radius_km, biaya_per_km, min_biaya, jam_operasional, is_active } =
      req.body;

    const [result] = await pool.query(
      "UPDATE outlets SET nama = ?, alamat = ?, lat = ?, lng = ?, coverage_radius_km = ?, biaya_per_km = ?, min_biaya = ?, jam_operasional = ?, is_active = ? WHERE id = ? AND admin_user_id = ?",
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
        userId,
      ]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Outlet tidak ditemukan atau bukan milik Anda" });
    }
    return res.json({ success: true, message: "Outlet diperbarui" });
  } catch (err) {
    console.error("updateForUser error:", err);
    return res.status(500).json({ success: false, message: "Gagal memperbarui outlet" });
  }
};
