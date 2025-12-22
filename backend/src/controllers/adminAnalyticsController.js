const pool = require("../config/db");

/**
 * Admin Analytics Controller
 * Provides platform-wide statistics and insights
 * - Superadmin: sees all data
 * - Regular admin: sees only data from their outlet(s)
 */

// Helper function to get admin's outlet IDs
const getAdminOutletIds = async (userId) => {
    const [outlets] = await pool.query(
        `SELECT id FROM outlets WHERE owner_id = ?`,
        [userId]
    );
    return outlets.map(o => o.id);
};

// Get overview analytics
exports.getOverview = async (req, res) => {
    try {
        const userRole = req.user?.role;
        const userId = req.user?.id;
        const isSuperAdmin = userRole === 'superadmin';

        let outletFilter = '';
        let outletIds = [];

        // Jika bukan superadmin, filter berdasarkan outlet milik admin
        if (!isSuperAdmin) {
            outletIds = await getAdminOutletIds(userId);
            if (outletIds.length === 0) {
                // Admin tidak memiliki outlet
                return res.json({
                    success: true,
                    stats: {
                        users: 0,
                        partners: 0,
                        pendingPartners: 0,
                        totalOrders: 0,
                        totalRevenue: 0,
                        todayOrders: 0,
                        todayRevenue: 0,
                        ordersByStatus: [],
                        monthlyRevenue: [],
                        topOutlets: []
                    }
                });
            }
            outletFilter = ` AND outlet_id IN (${outletIds.map(() => '?').join(',')})`;
        }

        // Stats yang tetap sama (user, partner - hanya untuk superadmin)
        let usersCount = [{ total: 0 }];
        let partnersCount = [{ total: 0 }];
        let pendingPartners = [{ total: 0 }];

        if (isSuperAdmin) {
            [usersCount] = await pool.query("SELECT COUNT(*) as total FROM users");
            [partnersCount] = await pool.query("SELECT COUNT(*) as total FROM partner_profiles WHERE status = 'approved'");
            [pendingPartners] = await pool.query("SELECT COUNT(*) as total FROM partner_profiles WHERE status = 'pending'");
        }

        // Total orders (filtered by outlet for admin)
        let ordersCountQuery = "SELECT COUNT(*) as total FROM orders WHERE 1=1" + outletFilter;
        const [ordersCount] = await pool.query(ordersCountQuery, outletIds);

        // Total revenue (filtered by outlet for admin)
        let revenueQuery = "SELECT COALESCE(SUM(total_pembayaran), 0) as total FROM orders WHERE payment_status = 'paid'" + outletFilter;
        const [revenue] = await pool.query(revenueQuery, outletIds);

        // Today's orders (filtered by outlet for admin)
        let todayOrdersQuery = "SELECT COUNT(*) as total FROM orders WHERE DATE(tanggal) = CURDATE()" + outletFilter;
        const [todayOrders] = await pool.query(todayOrdersQuery, outletIds);

        // Today's revenue (filtered by outlet for admin)
        let todayRevenueQuery = "SELECT COALESCE(SUM(total_pembayaran), 0) as total FROM orders WHERE DATE(tanggal) = CURDATE() AND payment_status = 'paid'" + outletFilter;
        const [todayRevenue] = await pool.query(todayRevenueQuery, outletIds);

        // Orders by status (filtered by outlet for admin)
        let ordersByStatusQuery = "SELECT status, COUNT(*) as count FROM orders WHERE 1=1" + outletFilter + " GROUP BY status";
        const [ordersByStatus] = await pool.query(ordersByStatusQuery, outletIds);

        // Monthly revenue (filtered by outlet for admin)
        let monthlyRevenueQuery = `
            SELECT 
                DATE_FORMAT(tanggal, '%Y-%m') as month,
                COUNT(*) as orders,
                COALESCE(SUM(total_pembayaran), 0) as revenue
            FROM orders 
            WHERE tanggal >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                AND payment_status = 'paid'
                ${outletFilter}
            GROUP BY DATE_FORMAT(tanggal, '%Y-%m')
            ORDER BY month ASC
        `;
        const [monthlyRevenue] = await pool.query(monthlyRevenueQuery, outletIds);

        // Top outlets (filtered for admin)
        let topOutletsQuery;
        if (isSuperAdmin) {
            topOutletsQuery = `
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
            `;
            var [topOutlets] = await pool.query(topOutletsQuery);
        } else {
            topOutletsQuery = `
                SELECT 
                    o.id,
                    o.nama,
                    COUNT(ord.id) as order_count,
                    COALESCE(SUM(ord.total_pembayaran), 0) as total_revenue
                FROM outlets o
                LEFT JOIN orders ord ON o.id = ord.outlet_id
                WHERE o.id IN (${outletIds.map(() => '?').join(',')})
                GROUP BY o.id
                ORDER BY order_count DESC
                LIMIT 5
            `;
            var [topOutlets] = await pool.query(topOutletsQuery, outletIds);
        }

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
        const userRole = req.user?.role;
        const userId = req.user?.id;
        const isSuperAdmin = userRole === 'superadmin';

        let outletFilter = '';
        let outletIds = [];

        if (!isSuperAdmin) {
            outletIds = await getAdminOutletIds(userId);
            if (outletIds.length === 0) {
                return res.json({
                    success: true,
                    activities: {
                        recentOrders: [],
                        recentPartners: [],
                        recentReviews: []
                    }
                });
            }
            outletFilter = ` AND o.outlet_id IN (${outletIds.map(() => '?').join(',')})`;
        }

        let recentOrders = [];
        let recentPartners = [];
        let recentReviews = [];

        // Recent orders - with error handling
        try {
            let ordersQuery = `
                SELECT 
                    o.id,
                    o.tanggal,
                    o.status,
                    o.total_pembayaran,
                    u.nama as customer_name,
                    ol.nama as outlet_name
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                LEFT JOIN outlets ol ON o.outlet_id = ol.id
                WHERE 1=1 ${outletFilter}
                ORDER BY o.tanggal DESC
                LIMIT 10
            `;
            const [orders] = await pool.query(ordersQuery, outletIds);
            recentOrders = orders || [];
        } catch (orderErr) {
            console.error("Error fetching recent orders:", orderErr.message);
        }

        // Recent partner applications - only for superadmin
        if (isSuperAdmin) {
            try {
                const [partners] = await pool.query(`
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
                recentPartners = partners || [];
            } catch (partnerErr) {
                console.error("Error fetching recent partners:", partnerErr.message);
            }
        }

        // Recent reviews - filtered by outlet for admin
        try {
            let reviewsQuery;
            if (isSuperAdmin) {
                reviewsQuery = `
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
                `;
                const [reviews] = await pool.query(reviewsQuery);
                recentReviews = reviews || [];
            } else {
                reviewsQuery = `
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
                    WHERE r.outlet_id IN (${outletIds.map(() => '?').join(',')})
                    ORDER BY r.created_at DESC
                    LIMIT 5
                `;
                const [reviews] = await pool.query(reviewsQuery, outletIds);
                recentReviews = reviews || [];
            }
        } catch (reviewErr) {
            console.error("Error fetching recent reviews:", reviewErr.message);
        }

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
