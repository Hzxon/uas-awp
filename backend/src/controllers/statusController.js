const pool = require("../config/db");
const { logAudit } = require("../utils/audit");
const { sendStatusNotification } = require("../utils/notify");

const STATUS_FLOW = [
  "pickup_scheduled",
  "picked_up",
  "washing",
  "drying",
  "delivering",
  "delivered",
];

const validateStatus = (status) => STATUS_FLOW.includes(status);

let statusTableReady = false;
const ensureStatusTable = async () => {
  if (statusTableReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_status_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      status VARCHAR(50) NOT NULL,
      note TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  statusTableReady = true;
};

exports.getTimeline = async (req, res) => {
  try {
    await ensureStatusTable();
    const userId = req.user.id;
    const orderId = req.params.id;
    const [orders] = await pool.query("SELECT user_id FROM orders WHERE id = ?", [orderId]);
    if (!orders[0] || orders[0].user_id !== userId) {
      return res.status(404).json({ success: false, message: "Order tidak ditemukan" });
    }
    const [logs] = await pool.query(
      "SELECT status, note, created_at FROM order_status_logs WHERE order_id = ? ORDER BY created_at ASC",
      [orderId]
    );
    return res.json({ success: true, logs });
  } catch (err) {
    console.error("getTimeline error:", err);
    return res.status(500).json({ success: false, message: "Gagal mengambil timeline" });
  }
};

// Admin/superadmin simulation update
exports.updateStatus = async (req, res) => {
  try {
    await ensureStatusTable();
    const orderId = req.params.id;
    const { status, note } = req.body;
    if (!validateStatus(status)) {
      return res.status(400).json({ success: false, message: "Status tidak valid" });
    }
    const [orders] = await pool.query("SELECT id FROM orders WHERE id = ?", [orderId]);
    if (!orders[0]) {
      return res.status(404).json({ success: false, message: "Order tidak ditemukan" });
    }
    await pool.query(
      "INSERT INTO order_status_logs (order_id, status, note, created_at) VALUES (?, ?, ?, NOW())",
      [orderId, status, note || ""]
    );
    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);
    await logAudit({
      actorId: req.user?.id,
      action: "update_status",
      targetType: "order",
      targetId: orderId,
      meta: { status, note },
    });
    await sendStatusNotification({ orderId, status, userId: req.user?.id });
    return res.json({ success: true, message: "Status diperbarui" });
  } catch (err) {
    console.error("updateStatus error:", err);
    return res.status(500).json({ success: false, message: "Gagal memperbarui status" });
  }
};
