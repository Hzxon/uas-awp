const pool = require("../config/db");

const DEFAULT_TAX_RATE = 0.1;

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
  console.log("Masuk ke api createOrder!");
  try {
    const userId = req.user.id;
    const tanggal = new Date(); 

    // --- DEBUGGING LOG (Cek Terminal Backend saat klik Bayar) ---
    console.log("🔥 [Backend] Create Order Triggered!");
    console.log("📦 [Backend] Raw Items dari Frontend:", JSON.stringify(req.body.items, null, 2));

    const rawItems = Array.isArray(req.body.items) ? req.body.items : [];
    const items = sanitizeItems(rawItems);

    console.log("✅ [Backend] Items setelah Sanitize:", JSON.stringify(items, null, 2));

    // Validasi Item Kosong
    if (items.length === 0) {
      console.error("❌ [Backend] Error: Item kosong setelah filter!");
      return res.status(400).json({
        success: false,
        message: "Item pesanan tidak boleh kosong. Pastikan layanan_id atau produk_id terkirim.",
      });
    }

    const deliveryFee = Number(req.body.deliveryFee) || 0;
    // Gunakan subtotal dari item yang sudah disanitize
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    
    const taxRate = typeof req.body.taxRate === "number" && req.body.taxRate >= 0
        ? req.body.taxRate
        : DEFAULT_TAX_RATE;

    const taxAmount = Math.round(subtotal * taxRate);
    const total = subtotal + taxAmount + deliveryFee;

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. INSERT ke tabel ORDERS
      // PERBAIKAN: Disesuaikan dengan screenshot tabel (hanya user_id, tanggal, total, status)
      // Hapus: subtotal, tax_amount, delivery_fee karena kolomnya TIDAK ADA di tabel orders kamu
      const [orderResult] = await connection.query(
        "INSERT INTO orders (user_id, subtotal, tax_amount, delivery_fee, total, tanggal, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [userId, subtotal, taxAmount, deliveryFee, total, tanggal, "pending"]
      );

      const orderId = orderResult.insertId;

      // 2. INSERT ke tabel ORDER_DETAILS
      // Pastikan urutan array sesuai query SQL
      const itemValues = items.map((item) => [
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

      console.log("🎉 [Backend] Order Berhasil Dibuat: ID", orderId);

      return res.status(201).json({
        success: true,
        message: "Pesanan berhasil dibuat",
        orderId,
        summary: { subtotal, taxAmount, deliveryFee, total },
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
    // PERBAIKAN: Query Select juga disesuaikan agar tidak error field not found
    const [orders] = await pool.query(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC",
      [req.user.id]
    );
    return res.json({ success: true, orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengambil data pesanan" });
  }
};