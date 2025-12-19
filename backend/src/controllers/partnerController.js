const pool = require("../config/db");

/**
 * Partner Controller
 * Handles partner registration, profile management, dashboard, and order management
 */

// Register as a new partner (customer becomes partner)
exports.registerPartner = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const userId = req.user.id;
        const {
            business_name,
            business_license,
            bank_name,
            bank_account,
            bank_holder,
            outlet_name,
            outlet_address,
            outlet_phone,
            outlet_description,
            lat,
            lng
        } = req.body;

        // Validation
        if (!business_name || !outlet_name || !outlet_address) {
            return res.status(400).json({
                success: false,
                message: "Nama bisnis, nama outlet, dan alamat outlet wajib diisi"
            });
        }

        // Check if user already has a partner profile
        const [existing] = await connection.query(
            "SELECT id FROM partner_profiles WHERE user_id = ?",
            [userId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Anda sudah memiliki profil partner"
            });
        }

        // Create outlet for the partner
        const [outletResult] = await connection.query(
            `INSERT INTO outlets (nama, alamat, lat, lng, phone, description, owner_id, is_active, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW())`,
            [
                outlet_name,
                outlet_address,
                lat || 0,
                lng || 0,
                outlet_phone || "",
                outlet_description || "",
                userId
            ]
        );

        const outletId = outletResult.insertId;

        // Create partner profile
        await connection.query(
            `INSERT INTO partner_profiles 
       (user_id, outlet_id, business_name, business_license, bank_name, bank_account, bank_holder, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
            [
                userId,
                outletId,
                business_name,
                business_license || "",
                bank_name || "",
                bank_account || "",
                bank_holder || ""
            ]
        );

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Pendaftaran partner berhasil! Menunggu persetujuan admin."
        });

    } catch (err) {
        await connection.rollback();
        console.error("registerPartner error:", err);
        return res.status(500).json({
            success: false,
            message: "Gagal mendaftarkan partner"
        });
    } finally {
        connection.release();
    }
};

// Get partner's own profile
exports.getPartnerProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const [profiles] = await pool.query(
            `SELECT pp.*, o.nama as outlet_name, o.alamat as outlet_address, 
              o.phone as outlet_phone, o.description as outlet_description,
              o.lat, o.lng, o.is_active, o.rating_avg, o.rating_count,
              o.jam_operasional, o.logo_url
       FROM partner_profiles pp
       LEFT JOIN outlets o ON pp.outlet_id = o.id
       WHERE pp.user_id = ?`,
            [userId]
        );

        if (profiles.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Profil partner tidak ditemukan"
            });
        }

        return res.json({
            success: true,
            profile: profiles[0]
        });

    } catch (err) {
        console.error("getPartnerProfile error:", err);
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil profil partner"
        });
    }
};

// Update partner profile
exports.updatePartnerProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            business_name,
            bank_name,
            bank_account,
            bank_holder,
            outlet_name,
            outlet_address,
            outlet_phone,
            outlet_description,
            jam_operasional,
            lat,
            lng
        } = req.body;

        // Get partner's outlet
        const [profiles] = await pool.query(
            "SELECT outlet_id FROM partner_profiles WHERE user_id = ?",
            [userId]
        );

        if (profiles.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Profil partner tidak ditemukan"
            });
        }

        const outletId = profiles[0].outlet_id;

        // Update partner profile
        await pool.query(
            `UPDATE partner_profiles 
       SET business_name = ?, bank_name = ?, bank_account = ?, bank_holder = ?
       WHERE user_id = ?`,
            [business_name, bank_name || "", bank_account || "", bank_holder || "", userId]
        );

        // Update outlet
        await pool.query(
            `UPDATE outlets 
       SET nama = ?, alamat = ?, phone = ?, description = ?, jam_operasional = ?, lat = ?, lng = ?
       WHERE id = ?`,
            [outlet_name, outlet_address, outlet_phone || "", outlet_description || "", jam_operasional || "", lat || 0, lng || 0, outletId]
        );

        return res.json({
            success: true,
            message: "Profil berhasil diperbarui"
        });

    } catch (err) {
        console.error("updatePartnerProfile error:", err);
        return res.status(500).json({
            success: false,
            message: "Gagal memperbarui profil"
        });
    }
};

// Get partner dashboard data
exports.getPartnerDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get partner's outlet
        const [profiles] = await pool.query(
            "SELECT outlet_id, status FROM partner_profiles WHERE user_id = ?",
            [userId]
        );

        if (profiles.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Profil partner tidak ditemukan"
            });
        }

        const { outlet_id, status } = profiles[0];

        if (status !== 'approved') {
            return res.json({
                success: true,
                status: status,
                message: status === 'pending' ? 'Menunggu persetujuan admin' : 'Partner tidak aktif',
                stats: null
            });
        }

        // Get today's stats
        const today = new Date().toISOString().split('T')[0];

        const [ordersToday] = await pool.query(
            `SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue
       FROM orders WHERE outlet_id = ? AND DATE(created_at) = ?`,
            [outlet_id, today]
        );

        // Get pending orders count
        const [pendingOrders] = await pool.query(
            `SELECT COUNT(*) as count FROM orders 
       WHERE outlet_id = ? AND status IN ('pending', 'processing', 'washing')`,
            [outlet_id]
        );

        // Get total orders this month
        const [monthlyOrders] = await pool.query(
            `SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue
       FROM orders WHERE outlet_id = ? AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())`,
            [outlet_id]
        );

        // Get outlet rating
        const [outlet] = await pool.query(
            "SELECT rating_avg, rating_count FROM outlets WHERE id = ?",
            [outlet_id]
        );

        return res.json({
            success: true,
            status: status,
            stats: {
                today: {
                    orders: ordersToday[0].count,
                    revenue: ordersToday[0].revenue
                },
                pending_orders: pendingOrders[0].count,
                monthly: {
                    orders: monthlyOrders[0].count,
                    revenue: monthlyOrders[0].revenue
                },
                rating: outlet[0]?.rating_avg || 0,
                rating_count: outlet[0]?.rating_count || 0
            }
        });

    } catch (err) {
        console.error("getPartnerDashboard error:", err);
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil data dashboard"
        });
    }
};

// Get partner's orders
exports.getPartnerOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, page = 1, limit = 20 } = req.query;

        // Get partner's outlet
        const [profiles] = await pool.query(
            "SELECT outlet_id FROM partner_profiles WHERE user_id = ? AND status = 'approved'",
            [userId]
        );

        if (profiles.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Partner belum disetujui atau tidak ditemukan"
            });
        }

        const outletId = profiles[0].outlet_id;
        const offset = (page - 1) * limit;

        let query = `
      SELECT o.*, u.nama as customer_name, u.email as customer_email,
             a.alamat as delivery_address
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN addresses a ON o.address_id = a.id
      WHERE o.outlet_id = ?
    `;
        const params = [outletId];

        if (status) {
            query += " AND o.status = ?";
            params.push(status);
        }

        query += " ORDER BY o.created_at DESC LIMIT ? OFFSET ?";
        params.push(parseInt(limit), parseInt(offset));

        const [orders] = await pool.query(query, params);

        // Get order items for each order
        for (let order of orders) {
            const [items] = await pool.query(
                "SELECT * FROM order_items WHERE order_id = ?",
                [order.id]
            );
            order.items = items;
        }

        // Get total count
        let countQuery = "SELECT COUNT(*) as total FROM orders WHERE outlet_id = ?";
        const countParams = [outletId];
        if (status) {
            countQuery += " AND status = ?";
            countParams.push(status);
        }
        const [countResult] = await pool.query(countQuery, countParams);

        return res.json({
            success: true,
            orders: orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total,
                pages: Math.ceil(countResult[0].total / limit)
            }
        });

    } catch (err) {
        console.error("getPartnerOrders error:", err);
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil data pesanan"
        });
    }
};

// Update order status (partner)
exports.updateOrderStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = req.params.id;
        const { status, note } = req.body;

        const validStatuses = ['confirmed', 'processing', 'washing', 'drying', 'ironing', 'ready', 'delivering', 'completed'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status tidak valid"
            });
        }

        // Verify partner owns this order's outlet
        const [profiles] = await pool.query(
            "SELECT outlet_id FROM partner_profiles WHERE user_id = ? AND status = 'approved'",
            [userId]
        );

        if (profiles.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Partner tidak aktif"
            });
        }

        const outletId = profiles[0].outlet_id;

        // Check order belongs to partner's outlet
        const [orders] = await pool.query(
            "SELECT id FROM orders WHERE id = ? AND outlet_id = ?",
            [orderId, outletId]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Pesanan tidak ditemukan"
            });
        }

        // Update order status
        await pool.query(
            "UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?",
            [status, orderId]
        );

        // Log to timeline (if table exists)
        try {
            await pool.query(
                "INSERT INTO order_timeline (order_id, status, note, created_by, created_at) VALUES (?, ?, ?, ?, NOW())",
                [orderId, status, note || "", userId]
            );
        } catch (timelineErr) {
            // Timeline table might not exist yet, ignore
            console.log("Timeline logging skipped:", timelineErr.message);
        }

        return res.json({
            success: true,
            message: "Status pesanan berhasil diperbarui"
        });

    } catch (err) {
        console.error("updateOrderStatus error:", err);
        return res.status(500).json({
            success: false,
            message: "Gagal memperbarui status pesanan"
        });
    }
};
