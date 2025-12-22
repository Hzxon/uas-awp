const pool = require("../config/db");

const DEFAULT_TAX_RATE = 0.1;

const haversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// --- FUNGSI SANITIZE (DIPERBAIKI) ---
const sanitizeItems = (items = []) => {
  return items
    .map((item) => ({
      // Mapping pastikan sesuai dengan payload Frontend
      layanan_id: item.layanan_id || null,
      produk_id: item.produk_id || null,
      qty: Number(item.qty) || 0,
      harga_satuan: Number(item.harga_satuan) || 0,
      subtotal: Number(item.subtotal) || 0,
    }))
    // Filter HANYA berdasarkan ID dan Qty (Tidak butuh 'name')
    .filter((item) => item.qty > 0 && (item.layanan_id !== null || item.produk_id !== null));
};

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const tanggal = new Date();
    const addressId = req.body.address_id;
    const outletId = req.body.outlet_id;
    const pickupSlot = req.body.pickup_slot || null;

    const rawItems = Array.isArray(req.body.items) ? req.body.items : [];
    const items = sanitizeItems(rawItems);

    // Validasi Item Kosong
    if (items.length === 0) {
      console.error("❌ [Backend] Error: Item kosong setelah filter!");
      return res.status(400).json({
        success: false,
        message: "Item pesanan tidak boleh kosong. Pastikan layanan_id atau produk_id terkirim.",
      });
    }

    if (!addressId) {
      return res.status(400).json({ success: false, message: "Alamat penjemputan wajib dipilih" });
    }
    if (!outletId) {
      return res.status(400).json({ success: false, message: "Outlet wajib dipilih" });
    }

    const deliveryFee = Number(req.body.deliveryFee) || 0;

    const connection = await pool.getConnection();

    // validasi alamat milik user
    const [addressRows] = await connection.query("SELECT id FROM addresses WHERE id = ? AND user_id = ?", [
      addressId,
      userId,
    ]);
    if (!addressRows[0]) {
      connection.release();
      return res.status(400).json({ success: false, message: "Alamat tidak valid" });
    }

    // ambil outlet dan jarak
    const [outletRows] = await connection.query(
      "SELECT id, lat, lng, coverage_radius_km, biaya_per_km, min_biaya FROM outlets WHERE id = ? AND is_active = 1",
      [outletId]
    );
    const outlet = outletRows[0];
    if (!outlet) {
      connection.release();
      return res.status(400).json({ success: false, message: "Outlet tidak tersedia" });
    }

    // Fetch harga resmi dari database agar tidak percaya data frontend
    const layananIds = [...new Set(items.filter((i) => i.layanan_id).map((i) => i.layanan_id))];
    const produkIds = [...new Set(items.filter((i) => i.produk_id).map((i) => i.produk_id))];

    const layananPriceMap = {};
    const produkPriceMap = {};

    if (layananIds.length > 0) {
      const [rows] = await connection.query(
        `SELECT id, harga FROM layanan WHERE id IN (${layananIds.map(() => "?").join(",")})`,
        layananIds
      );
      rows.forEach((row) => {
        layananPriceMap[row.id] = Number(row.harga);
      });
    }

    if (produkIds.length > 0) {
      const [rows] = await connection.query(
        `SELECT id, harga FROM produk WHERE id IN (${produkIds.map(() => "?").join(",")})`,
        produkIds
      );
      rows.forEach((row) => {
        produkPriceMap[row.id] = Number(row.harga);
      });
    }

    const normalizedItems = items.map((item) => {
      const hargaLayanan = item.layanan_id ? layananPriceMap[item.layanan_id] : null;
      const hargaProduk = item.produk_id ? produkPriceMap[item.produk_id] : null;
      const harga_satuan = item.layanan_id ? hargaLayanan : hargaProduk;

      if (harga_satuan === undefined || harga_satuan === null) {
        throw new Error("Item tidak ditemukan atau harga tidak valid");
      }

      const subtotal = item.qty * harga_satuan;
      return { ...item, harga_satuan, subtotal };
    });

    const subtotal = normalizedItems.reduce((sum, item) => sum + item.subtotal, 0);

    const taxRate = typeof req.body.taxRate === "number" && req.body.taxRate >= 0
      ? req.body.taxRate
      : DEFAULT_TAX_RATE;

    const taxAmount = Math.round(subtotal * taxRate);
    // Hitung jarak dan biaya pengiriman berdasarkan outlet & alamat (butuh lat lng alamat)
    let deliveryDistanceKm = null;
    let deliveryFeeCalc = deliveryFee;

    try {
      const [addrDetailRows] = await connection.query(
        "SELECT lat, lng FROM addresses WHERE id = ?",
        [addressId]
      );
      const addr = addrDetailRows[0];
      if (addr && addr.lat !== null && addr.lng !== null && outlet.lat !== null && outlet.lng !== null) {
        deliveryDistanceKm = haversineDistanceKm(Number(addr.lat), Number(addr.lng), Number(outlet.lat), Number(outlet.lng));
        if (deliveryDistanceKm && outlet.coverage_radius_km && deliveryDistanceKm > Number(outlet.coverage_radius_km)) {
          throw new Error("Alamat di luar jangkauan outlet");
        }
        const fee = Math.max(
          Number(outlet.min_biaya || 0),
          Math.ceil(deliveryDistanceKm * Number(outlet.biaya_per_km || 0))
        );
        deliveryFeeCalc = fee;
      }
    } catch (calcErr) {
      await connection.release();
      console.error("Distance calc error:", calcErr);
      return res.status(400).json({ success: false, message: calcErr.message || "Gagal menghitung ongkir" });
    }

    const total_pembayaran = subtotal + taxAmount + deliveryFeeCalc;

    try {
      await connection.beginTransaction();

      // 1. INSERT ke tabel ORDERS
      const [orderResult] = await connection.query(
        "INSERT INTO orders (user_id, outlet_id, pickup_slot, delivery_distance_km, subtotal, tax_amount, delivery_fee, total_pembayaran, tanggal, status, payment_status, payment_method, address_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          userId,
          outletId,
          pickupSlot,
          deliveryDistanceKm,
          subtotal,
          taxAmount,
          deliveryFeeCalc,
          total_pembayaran,
          tanggal,
          "pending",
          "pending",
          null,
          addressId,
        ]
      );

      const orderId = orderResult.insertId;

      // 2. INSERT ke tabel ORDER_DETAILS
      const itemValues = normalizedItems.map((item) => [
        orderId,
        item.layanan_id,
        item.produk_id,
        item.qty,
        item.harga_satuan,
        item.subtotal
      ]);

      await connection.query(
        "INSERT INTO order_details (order_id, layanan_id, produk_id, qty, harga_satuan, subtotal) VALUES ?",
        [itemValues]
      );

      await connection.commit();

      return res.status(201).json({
        success: true,
        message: "Pesanan berhasil dibuat",
        orderId,
        summary: { subtotal, taxAmount, deliveryFee: deliveryFeeCalc, total_pembayaran },
      });

    } catch (err) {
      await connection.rollback();
      console.error("❌ [Backend] SQL Error:", err);
      return res.status(500).json({
        success: false,
        message: "Gagal membuat pesanan: " + err.message,
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("❌ [Backend] System Error:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.listOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC",
      [req.user.id]
    );
    return res.json({ success: true, orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengambil data pesanan" });
  }
};

exports.listAllOrders = async (req, res) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    // Jika superadmin, tampilkan semua orders
    if (userRole === 'superadmin') {
      const [orders] = await pool.query(
        `SELECT o.id, o.user_id, o.outlet_id, o.total_pembayaran, o.subtotal, o.tax_amount, o.delivery_fee,
                o.status, o.payment_status, o.payment_method, o.tanggal,
                u.nama AS user_nama, a.nama_penerima, a.phone, a.alamat, ot.nama AS outlet_nama
         FROM orders o
         LEFT JOIN Users u ON u.id = o.user_id
         LEFT JOIN addresses a ON a.id = o.address_id
         LEFT JOIN outlets ot ON ot.id = o.outlet_id
         ORDER BY o.id DESC`
      );
      return res.json({ success: true, orders });
    }

    // Jika admin biasa, hanya tampilkan orders dari outlet miliknya
    // Cari outlet_id yang dimiliki admin ini
    const [outlets] = await pool.query(
      `SELECT id FROM outlets WHERE owner_id = ?`,
      [userId]
    );

    if (outlets.length === 0) {
      // Admin tidak memiliki outlet manapun
      return res.json({ success: true, orders: [] });
    }

    const outletIds = outlets.map(o => o.id);
    const placeholders = outletIds.map(() => '?').join(',');

    const [orders] = await pool.query(
      `SELECT o.id, o.user_id, o.outlet_id, o.total_pembayaran, o.subtotal, o.tax_amount, o.delivery_fee,
              o.status, o.payment_status, o.payment_method, o.tanggal,
              u.nama AS user_nama, a.nama_penerima, a.phone, a.alamat, ot.nama AS outlet_nama
       FROM orders o
       LEFT JOIN Users u ON u.id = o.user_id
       LEFT JOIN addresses a ON a.id = o.address_id
       LEFT JOIN outlets ot ON ot.id = o.outlet_id
       WHERE o.outlet_id IN (${placeholders})
       ORDER BY o.id DESC`,
      outletIds
    );

    return res.json({ success: true, orders });
  } catch (err) {
    console.error("listAllOrders error:", err);
    return res.status(500).json({ success: false, message: "Gagal mengambil seluruh data pesanan" });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    const [orderRows] = await pool.query(
      "SELECT o.*, a.nama_penerima, a.phone, a.alamat, a.lat, a.lng FROM orders o LEFT JOIN addresses a ON a.id = o.address_id WHERE o.id = ? AND o.user_id = ?",
      [orderId, userId]
    );
    const order = orderRows[0];
    if (!order) {
      return res.status(404).json({ success: false, message: "Order tidak ditemukan" });
    }

    const [items] = await pool.query(
      "SELECT od.*, l.nama AS layanan_nama, p.nama AS produk_nama FROM order_details od LEFT JOIN layanan l ON l.id = od.layanan_id LEFT JOIN produk p ON p.id = od.produk_id WHERE od.order_id = ?",
      [orderId]
    );

    return res.json({ success: true, order: { ...order, items } });
  } catch (err) {
    console.error("getOrder error:", err);
    return res.status(500).json({ success: false, message: "Gagal mengambil detail order" });
  }
};
