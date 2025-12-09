const pool = require("../config/db");

let auditTableReady = false;

const ensureAuditTable = async () => {
  if (auditTableReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      actor_id INT NULL,
      action VARCHAR(100) NOT NULL,
      target_type VARCHAR(50) NOT NULL,
      target_id INT NULL,
      meta TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  auditTableReady = true;
};

const logAudit = async ({ actorId, action, targetType, targetId, meta }) => {
  try {
    await ensureAuditTable();
    await pool.query(
      "INSERT INTO audit_logs (actor_id, action, target_type, target_id, meta) VALUES (?, ?, ?, ?, ?)",
      [actorId || null, action, targetType, targetId || null, JSON.stringify(meta || {})]
    );
  } catch (err) {
    console.error("Audit log error:", err.message);
  }
};

module.exports = { logAudit };
