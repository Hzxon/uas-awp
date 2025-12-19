const pool = require("../config/db");

/**
 * Admin Analytics Controller
 * Provides platform-wide statistics and insights
 */

// Get overview analytics
exports.getOverview = async (req, res) => {
    try {
        // Total users
        const [usersCount] = await pool.query(
            "SELECT COUNT(*) as total FROM users"
        );

        // Total partners
        const [partnersCount] = await pool.query(
            "SELECT COUNT(*) as total FROM partner_profiles WHERE status = 'approved'"
        );

        // Pending partners
        const [pendingPartners] = await pool.query(
            "SELECT COUNT(*) as total FROM partner_profiles WHERE status = 'pending'"
        );

        // Total orders
        const [ordersCount] = await pool.query(
            "SELECT COUNT(*) as total FROM orders"
        );

        // Total revenue
        const [revenue] = await pool.query(
            "SELECT COALESCE(SUM(total_pembayaran), 0) as total FROM orders WHERE payment_status = 'paid'"
        );

        // Today's orders
        const [todayOrders] = await pool.query(
            "SELECT COUNT(*) as total FROM orders WHERE DATE(tanggal) = CURDATE()"
        );

        // Today's revenue
        const [todayRevenue] = await pool.query(
            "SELECT COALESCE(SUM(total_pembayaran), 0) as total FROM orders WHERE DATE(tanggal) = CURDATE() AND payment_status = 'paid'"
        );

        // Orders by status
        const [ordersByStatus] = await pool.query(
            "SELECT status, COUNT(*) as count FROM orders GROUP BY status"
        );

        // Monthly revenue (last 6 months)
        const [monthlyRevenue] = await pool.query(`
      SELECT 
        DATE_FORMAT(tanggal, '%Y-%m') as month,
        COUNT(*) as orders,
        COALESCE(SUM(total_pembayaran), 0) as revenue
      FROM orders 
      WHERE tanggal >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        AND payment_status = 'paid'
      GROUP BY DATE_FORMAT(tanggal, '%Y-%m')
      ORDER BY month ASC
    `);

        // Top outlets by orders
        const [topOutlets] = await pool.query(`
      SELECT 
        o.id,
        o.nama,
        COUNT(ord.id) as order_count,
        COALESCE(SUM(ord.total_pembayaran), 0) as total_revenue
      FROM outlets o
      LEFT JOIN orders ord ON o.id = ord.outlet_id
      GROUP BY o.id
      ORDER BY order_count DESC
      LIMIT 5
    `);

        return res.json({
            success: true,
            stats: {
                users: usersCount[0].total,
                partners: partnersCount[0].total,
                pendingPartners: pendingPartners[0].total,
                totalOrders: ordersCount[0].total,
                totalRevenue: revenue[0].total,
                todayOrders: todayOrders[0].total,
                todayRevenue: todayRevenue[0].total,
                ordersByStatus: ordersByStatus,
                monthlyRevenue: monthlyRevenue,
                topOutlets: topOutlets
            }
        });

    } catch (err) {
        console.error("getOverview error:", err);
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil data analitik"
        });
    }
};

// Get recent activities
exports.getRecentActivities = async (req, res) => {
    try {
        // Recent orders
        const [recentOrders] = await pool.query(`
      SELECT 
        o.id,
        o.tanggal,
        o.status,
        o.total_pembayaran,
        u.nama as customer_name,
        out.nama as outlet_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN outlets out ON o.outlet_id = out.id
      ORDER BY o.tanggal DESC
      LIMIT 10
    `);

        // Recent partner applications
        const [recentPartners] = await pool.query(`
      SELECT 
        p.id,
        p.business_name,
        p.status,
        p.created_at,
        u.nama as user_name,
        u.email
      FROM partner_profiles p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `);

        // Recent reviews
        const [recentReviews] = await pool.query(`
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        u.nama as user_name,
        o.nama as outlet_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN outlets o ON r.outlet_id = o.id
      ORDER BY r.created_at DESC
      LIMIT 5
    `);

        return res.json({
            success: true,
            activities: {
                recentOrders,
                recentPartners,
                recentReviews
            }
        });

    } catch (err) {
        console.error("getRecentActivities error:", err);
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil aktivitas terbaru"
        });
    }
};
