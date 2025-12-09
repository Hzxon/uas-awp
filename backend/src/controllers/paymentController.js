const pool = require("../config/db");
const PDFDocument = require("pdfkit");

const buildInvoiceNumber = (orderId) => `INV-${String(orderId).padStart(6, "0")}`;

// Mock payment creation: mark order pending, create payment record, return token/redirect
exports.createMockPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "orderId wajib diisi" });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [orderRows] = await connection.query(
        "SELECT id, user_id, total_pembayaran, status FROM orders WHERE id = ? FOR UPDATE",
        [orderId]
      );
      const order = orderRows[0];
      if (!order || order.user_id !== userId) {
        await connection.rollback();
        return res.status(404).json({ success: false, message: "Order tidak ditemukan" });
      }

      // Insert payment record (mock)
      const token = `MOCK-${Date.now()}-${orderId}`;
      const redirectUrl = `https://example.com/mock-pay/${token}`;
      await connection.query(
        "INSERT INTO payments (order_id, provider, status, amount, transaction_token, redirect_url, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
        [orderId, "mock", "pending", order.total_pembayaran, token, redirectUrl]
      );

      // Keep order status pending until confirm
      await connection.commit();

      return res.json({
        success: true,
        payment: { token, redirectUrl, orderId, amount: order.total_pembayaran },
      });
    } catch (err) {
      await connection.rollback();
      console.error("createMockPayment error:", err);
      return res.status(500).json({ success: false, message: "Gagal membuat pembayaran" });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("System error createMockPayment:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Mock confirm payment (simulating gateway callback)
exports.confirmMockPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentToken, paymentMethod } = req.body;

    if (!paymentToken) {
      return res.status(400).json({ success: false, message: "paymentToken wajib diisi" });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [paymentRows] = await connection.query(
        "SELECT p.id, p.order_id, p.status, p.amount, o.user_id FROM payments p JOIN orders o ON o.id = p.order_id WHERE p.transaction_token = ? FOR UPDATE",
        [paymentToken]
      );
      const payment = paymentRows[0];
      if (!payment || payment.user_id !== userId) {
        await connection.rollback();
        return res.status(404).json({ success: false, message: "Pembayaran tidak ditemukan" });
      }

      if (payment.status === "paid") {
        await connection.commit();
        return res.json({ success: true, message: "Pembayaran sudah dikonfirmasi" });
      }

      await connection.query("UPDATE payments SET status = ?, paid_at = NOW() WHERE transaction_token = ?", [
        "paid",
        paymentToken,
      ]);
      await connection.query(
        "UPDATE orders SET status = ?, payment_status = ?, payment_method = ?, invoice_number = ? WHERE id = ?",
        ["paid", "paid", paymentMethod || "mock", buildInvoiceNumber(payment.order_id), payment.order_id]
      );

      await connection.commit();
      return res.json({ success: true, message: "Pembayaran berhasil dikonfirmasi" });
    } catch (err) {
      await connection.rollback();
      console.error("confirmMockPayment error:", err);
      return res.status(500).json({ success: false, message: "Gagal mengonfirmasi pembayaran" });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("System error confirmMockPayment:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Invoice PDF
exports.downloadInvoice = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    const [orderRows] = await pool.query(
      "SELECT o.*, a.nama_penerima, a.phone, a.alamat FROM orders o LEFT JOIN addresses a ON a.id = o.address_id WHERE o.id = ?",
      [orderId]
    );
    const order = orderRows[0];
    if (!order || order.user_id !== userId) {
      return res.status(404).json({ success: false, message: "Order tidak ditemukan" });
    }

    const [items] = await pool.query(
      "SELECT od.*, l.nama AS layanan_nama, p.nama AS produk_nama FROM order_details od LEFT JOIN layanan l ON l.id = od.layanan_id LEFT JOIN produk p ON p.id = od.produk_id WHERE od.order_id = ?",
      [orderId]
    );

    const doc = new PDFDocument({ margin: 50 });
    const filename = `${buildInvoiceNumber(orderId)}.pdf`;

    res.setHeader("Content-disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-type", "application/pdf");

    doc.pipe(res);

    doc.fontSize(20).text("WashFast Invoice", { align: "left" });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#374151").text(`Invoice: ${order.invoice_number || buildInvoiceNumber(orderId)}`);
    doc.text(`Tanggal: ${new Date(order.tanggal).toLocaleString("id-ID")}`);
    doc.text(`Status: ${order.status}`);

    doc.moveDown();
    doc.fontSize(12).fillColor("#111827").text("Kepada:");
    doc.fontSize(11).fillColor("#374151");
    doc.text(order.nama_penerima || "-", { continued: false });
    doc.text(order.alamat || "-");
    if (order.phone) doc.text(`Telp: ${order.phone}`);

    doc.moveDown();
    doc.fillColor("#111827").fontSize(12).text("Rincian:");
    doc.moveDown(0.5);

    items.forEach((item) => {
      const name = item.layanan_nama || item.produk_nama || "Item";
      doc.fontSize(11).fillColor("#111827").text(`${name} x${item.qty}`, { continued: true });
      doc.text(` - Rp ${Number(item.subtotal).toLocaleString("id-ID")}`, { align: "right" });
    });

    doc.moveDown();
    doc.fontSize(12).fillColor("#111827").text(`Subtotal: Rp ${Number(order.subtotal).toLocaleString("id-ID")}`);
    doc.text(`Pajak: Rp ${Number(order.tax_amount).toLocaleString("id-ID")}`);
    doc.text(`Pengiriman: Rp ${Number(order.delivery_fee).toLocaleString("id-ID")}`);
    doc.text(`Total: Rp ${Number(order.total_pembayaran).toLocaleString("id-ID")}`, { align: "left" });

    doc.moveDown(2);
    doc.fontSize(10).fillColor("#6b7280").text("Terima kasih telah menggunakan WashFast.");

    doc.end();
  } catch (err) {
    console.error("downloadInvoice error:", err);
    return res.status(500).json({ success: false, message: "Gagal membuat invoice" });
  }
};
