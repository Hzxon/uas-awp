const pool = require("../config/db");

const DEFAULT_TAX_RATE = 0.1;

const sanitizeItems = (items = []) =>
  items
    .map((item) => ({
      item_code: item.id || null,
      name: item.name?.trim(),
      type: item.type || "other",
      unit: item.unit || null,
      price: Number(item.price) || 0,
      quantity: Number(item.qty) || 0,
    }))
    .filter((item) => item.name && item.price >= 0 && item.quantity > 0);

exports.createOrder = async (req, res) => {
  const userId = req.user.id;
  const rawItems = Array.isArray(req.body.items) ? req.body.items : [];
  const items = sanitizeItems(rawItems);

  if (items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Item pesanan tidak boleh kosong",
    });
  }

  const deliveryFee = Number(req.body.deliveryFee) || 0;
  const taxRate =
    typeof req.body.taxRate === "number" && req.body.taxRate >= 0
      ? req.body.taxRate
      : DEFAULT_TAX_RATE;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = Math.round(subtotal * taxRate);
  const total = subtotal + taxAmount + deliveryFee;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      "INSERT INTO orders (user_id, subtotal, tax_amount, delivery_fee, total, status) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, subtotal, taxAmount, deliveryFee, total, "pending"]
    );

    const orderId = orderResult.insertId;

    const itemValues = items.map((item) => [
      orderId,
      item.item_code,
      item.name,
      item.type,
      item.unit,
      item.price,
      item.quantity,
    ]);

    await connection.query(
      "INSERT INTO order_items (order_id, item_code, name, type, unit, price, quantity) VALUES ?",
      [itemValues]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Pesanan berhasil dibuat",
      orderId,
      summary: {
        subtotal,
        taxAmount,
        deliveryFee,
        total,
      },
    });
  } catch (err) {
    await connection.rollback();
    console.error("Create order error:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal membuat pesanan",
    });
  } finally {
    connection.release();
  }
};

exports.listOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      "SELECT id, subtotal, tax_amount AS taxAmount, delivery_fee AS deliveryFee, total, status, created_at AS createdAt FROM orders WHERE user_id = ? ORDER BY id DESC",
      [req.user.id]
    );

    return res.json({
      success: true,
      orders,
    });
  } catch (err) {
    console.error("List orders error:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data pesanan",
    });
  }
};
