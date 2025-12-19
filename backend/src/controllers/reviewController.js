const pool = require("../config/db");

/**
 * Review Controller
 * Handles customer reviews and partner replies
 */

// Create a review for completed order
exports.createReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { order_id, rating, comment } = req.body;

        if (!order_id || !rating) {
            return res.status(400).json({
                success: false,
                message: "Order ID dan rating wajib diisi"
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating harus antara 1-5"
            });
        }

        // Verify order belongs to user and is completed
        const [orders] = await pool.query(
            "SELECT id, outlet_id, status FROM orders WHERE id = ? AND user_id = ?",
            [order_id, userId]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Pesanan tidak ditemukan"
            });
        }

        if (orders[0].status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: "Hanya pesanan yang selesai yang dapat di-review"
            });
        }

        const outletId = orders[0].outlet_id;

        // Check if review already exists
        const [existingReview] = await pool.query(
            "SELECT id FROM reviews WHERE order_id = ?",
            [order_id]
        );

        if (existingReview.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Anda sudah memberikan review untuk pesanan ini"
            });
        }

        // Create review
        await pool.query(
            "INSERT INTO reviews (order_id, user_id, outlet_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
            [order_id, userId, outletId, rating, comment || ""]
        );

        // Update outlet rating
        const [ratingStats] = await pool.query(
            "SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE outlet_id = ?",
            [outletId]
        );

        await pool.query(
            "UPDATE outlets SET rating_avg = ?, rating_count = ? WHERE id = ?",
            [ratingStats[0].avg_rating || 0, ratingStats[0].count, outletId]
        );

        return res.status(201).json({
            success: true,
            message: "Review berhasil ditambahkan"
        });

    } catch (err) {
        console.error("createReview error:", err);
        return res.status(500).json({
            success: false,
            message: "Gagal menambahkan review"
        });
    }
};

// Get reviews for an outlet
exports.getOutletReviews = async (req, res) => {
    try {
        const outletId = req.params.outletId;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const [reviews] = await pool.query(
            `SELECT r.*, u.nama as user_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.outlet_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
            [outletId, parseInt(limit), parseInt(offset)]
        );

        const [countResult] = await pool.query(
            "SELECT COUNT(*) as total FROM reviews WHERE outlet_id = ?",
            [outletId]
        );

        const [ratingStats] = await pool.query(
            `SELECT 
        AVG(rating) as average,
        COUNT(*) as total,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
       FROM reviews WHERE outlet_id = ?`,
            [outletId]
        );

        return res.json({
            success: true,
            reviews: reviews,
            stats: ratingStats[0],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total,
                pages: Math.ceil(countResult[0].total / limit)
            }
        });

    } catch (err) {
        console.error("getOutletReviews error:", err);
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil review"
        });
    }
};

// Partner replies to a review
exports.replyToReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const reviewId = req.params.id;
        const { reply } = req.body;

        if (!reply) {
            return res.status(400).json({
                success: false,
                message: "Balasan tidak boleh kosong"
            });
        }

        // Get partner's outlet
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

        // Verify review belongs to partner's outlet
        const [reviews] = await pool.query(
            "SELECT id FROM reviews WHERE id = ? AND outlet_id = ?",
            [reviewId, outletId]
        );

        if (reviews.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Review tidak ditemukan"
            });
        }

        // Update review with reply
        await pool.query(
            "UPDATE reviews SET reply = ?, replied_at = NOW() WHERE id = ?",
            [reply, reviewId]
        );

        return res.json({
            success: true,
            message: "Balasan berhasil ditambahkan"
        });

    } catch (err) {
        console.error("replyToReview error:", err);
        return res.status(500).json({
            success: false,
            message: "Gagal menambahkan balasan"
        });
    }
};

// Get user's own reviews
exports.getMyReviews = async (req, res) => {
    try {
        const userId = req.user.id;

        const [reviews] = await pool.query(
            `SELECT r.*, o.nama as outlet_name
       FROM reviews r
       LEFT JOIN outlets o ON r.outlet_id = o.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
            [userId]
        );

        return res.json({
            success: true,
            reviews: reviews
        });

    } catch (err) {
        console.error("getMyReviews error:", err);
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil review"
        });
    }
};

// Check if user can review an order
exports.canReviewOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = req.params.orderId;

        // Check order exists and is completed
        const [orders] = await pool.query(
            "SELECT id, status FROM orders WHERE id = ? AND user_id = ?",
            [orderId, userId]
        );

        if (orders.length === 0) {
            return res.json({ success: true, canReview: false, reason: "Order not found" });
        }

        if (orders[0].status !== 'completed') {
            return res.json({ success: true, canReview: false, reason: "Order not completed" });
        }

        // Check if review already exists
        const [existingReview] = await pool.query(
            "SELECT id FROM reviews WHERE order_id = ?",
            [orderId]
        );

        if (existingReview.length > 0) {
            return res.json({ success: true, canReview: false, reason: "Already reviewed" });
        }

        return res.json({ success: true, canReview: true });

    } catch (err) {
        console.error("canReviewOrder error:", err);
        return res.status(500).json({
            success: false,
            message: "Gagal mengecek status review"
        });
    }
};
