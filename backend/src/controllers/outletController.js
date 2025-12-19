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

// Get single outlet by ID with reviews
exports.getById = async (req, res) => {
  try {
    const id = req.params.id;

    const [outlets] = await pool.query(
      `SELECT o.*, 
              (SELECT COUNT(*) FROM reviews WHERE outlet_id = o.id) as review_count,
              (SELECT AVG(rating) FROM reviews WHERE outlet_id = o.id) as avg_rating
       FROM outlets o 
       WHERE o.id = ? AND o.is_active = 1`,
      [id]
    );

    if (outlets.length === 0) {
      return res.status(404).json({ success: false, message: "Outlet tidak ditemukan" });
    }

    // Get services for this outlet (from layanan table)
    const [services] = await pool.query(
      "SELECT * FROM layanan WHERE is_active = 1 ORDER BY harga ASC"
    );

    // Get recent reviews
    const [reviews] = await pool.query(
      `SELECT r.*, u.nama as user_name 
       FROM reviews r 
       LEFT JOIN users u ON r.user_id = u.id 
       WHERE r.outlet_id = ? 
       ORDER BY r.created_at DESC 
       LIMIT 5`,
      [id]
    );

    return res.json({
      success: true,
      outlet: outlets[0],
      services: services,
      reviews: reviews
    });
  } catch (err) {
    console.error("getById outlet error:", err);
    return res.status(500).json({ success: false, message: "Gagal mengambil data outlet" });
  }
};

// Search outlets with filters
exports.search = async (req, res) => {
  try {
    const { q, min_rating, sort_by, lat, lng, radius } = req.query;

    let query = `
      SELECT o.id, o.nama, o.alamat, o.lat, o.lng, o.phone, o.description,
             o.jam_operasional, o.logo_url, o.rating_avg, o.rating_count,
             o.coverage_radius_km, o.biaya_per_km, o.min_biaya
      FROM outlets o
      WHERE o.is_active = 1
    `;
    const params = [];

    // Search by name
    if (q) {
      query += " AND (o.nama LIKE ? OR o.alamat LIKE ? OR o.description LIKE ?)";
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Filter by minimum rating
    if (min_rating) {
      query += " AND o.rating_avg >= ?";
      params.push(parseFloat(min_rating));
    }

    // Sort options
    switch (sort_by) {
      case 'rating':
        query += " ORDER BY o.rating_avg DESC, o.rating_count DESC";
        break;
      case 'name':
        query += " ORDER BY o.nama ASC";
        break;
      case 'newest':
        query += " ORDER BY o.id DESC";
        break;
      default:
        query += " ORDER BY o.rating_count DESC, o.rating_avg DESC";
    }

    query += " LIMIT 50";

    const [outlets] = await pool.query(query, params);

    return res.json({
      success: true,
      outlets: outlets,
      total: outlets.length
    });
  } catch (err) {
    console.error("search outlets error:", err);
    return res.status(500).json({ success: false, message: "Gagal mencari outlet" });
  }
};
