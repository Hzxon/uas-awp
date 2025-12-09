// Minimal notification stub for status changes.
// Extend with real provider (email/WA/webhook) when available.

const sendStatusNotification = async ({ orderId, status, userId }) => {
  // No-op if no provider configured
  const webhook = process.env.NOTIF_WEBHOOK_URL;
  if (!webhook) {
    console.log(`[notif] Order ${orderId} status -> ${status} (user ${userId || "-"})`);
    return;
  }
  try {
    // Implement webhook call here if desired.
    console.log(`[notif] Webhook placeholder to ${webhook} for order ${orderId} status ${status}`);
  } catch (err) {
    console.error("Notification send failed:", err.message);
  }
};

module.exports = { sendStatusNotification };
