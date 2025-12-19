const pool = require("../config/db");

/**
 * Admin Partner Controller
 * Handles partner approval and management by admins
 */

// List all partner applications
exports.listPartners = async (req, res) => {
    try {
        const { status } = req.query;

        let query = `
      SELECT pp.*, u.nama as user_name, u.email as user_email, u.phone as user_phone,
             o.nama as outlet_name, o.alamat as outlet_address, o.is_active as outlet_active
      FROM partner_profiles pp
      LEFT JOIN users u ON pp.user_id = u.id
      LEFT JOIN outlets o ON pp.outlet_id = o.id
    `;
        const params = [];

        if (status) {
            query += " WHERE pp.status = ?";
            params.push(status);
        }

        query += " ORDER BY pp.created_at DESC";

        const [partners] = await pool.query(query, params);

        return res.json({
            success: true,
            partners: partners
        });

    } catch (err) {
        console.error("listPartners error:", err);
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil data partner"
        });
    }
};

// Get single partner detail
exports.getPartner = async (req, res) => {
    try {
        const partnerId = req.params.id;

        const [partners] = await pool.query(
            `SELECT pp.*, u.nama as user_name, u.email as user_email, u.phone as user_phone,
              o.nama as outlet_name, o.alamat as outlet_address, o.is_active as outlet_active,
              o.phone as outlet_phone, o.description as outlet_description
       FROM partner_profiles pp
       LEFT JOIN users u ON pp.user_id = u.id
       LEFT JOIN outlets o ON pp.outlet_id = o.id
       WHERE pp.id = ?`,
            [partnerId]
        );

        if (partners.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Partner tidak ditemukan"
            });
        }

        return res.json({
            success: true,
            partner: partners[0]
        });

    } catch (err) {
        console.error("getPartner error:", err);
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil data partner"
        });
    }
};

// Approve partner application
exports.approvePartner = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const partnerId = req.params.id;
        const adminId = req.user.id;

        // Get partner info
        const [partners] = await connection.query(
            "SELECT user_id, outlet_id FROM partner_profiles WHERE id = ? AND status = 'pending'",
            [partnerId]
        );

        if (partners.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Partner tidak ditemukan atau sudah diproses"
            });
        }

        const { user_id, outlet_id } = partners[0];

        // Update partner status
        await connection.query(
            "UPDATE partner_profiles SET status = 'approved', approved_at = NOW(), approved_by = ? WHERE id = ?",
            [adminId, partnerId]
        );

        // Update user role to partner
        await connection.query(
            "UPDATE users SET role = 'partner' WHERE id = ?",
            [user_id]
        );

        // Activate outlet
        await connection.query(
            "UPDATE outlets SET is_active = 1 WHERE id = ?",
            [outlet_id]
        );

        await connection.commit();

        return res.json({
            success: true,
            message: "Partner berhasil disetujui"
        });

    } catch (err) {
        await connection.rollback();
        console.error("approvePartner error:", err);
        return res.status(500).json({
            success: false,
            message: "Gagal menyetujui partner"
        });
    } finally {
        connection.release();
    }
};

// Reject partner application
exports.rejectPartner = async (req, res) => {
    try {
        const partnerId = req.params.id;
        const { reason } = req.body;

        const [result] = await pool.query(
            "UPDATE partner_profiles SET status = 'rejected' WHERE id = ? AND status = 'pending'",
            [partnerId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Partner tidak ditemukan atau sudah diproses"
            });
        }

        return res.json({
            success: true,
            message: "Partner ditolak"
        });

    } catch (err) {
        console.error("rejectPartner error:", err);
        return res.status(500).json({
            success: false,
            message: "Gagal menolak partner"
        });
    }
};

// Suspend partner
exports.suspendPartner = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const partnerId = req.params.id;

        const [partners] = await connection.query(
            "SELECT outlet_id FROM partner_profiles WHERE id = ?",
            [partnerId]
        );

        if (partners.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Partner tidak ditemukan"
            });
        }

        // Update partner status
        await connection.query(
            "UPDATE partner_profiles SET status = 'suspended' WHERE id = ?",
            [partnerId]
        );

        // Deactivate outlet
        await connection.query(
            "UPDATE outlets SET is_active = 0 WHERE id = ?",
            [partners[0].outlet_id]
        );

        await connection.commit();

        return res.json({
            success: true,
            message: "Partner di-suspend"
        });

    } catch (err) {
        await connection.rollback();
        console.error("suspendPartner error:", err);
        return res.status(500).json({
            success: false,
            message: "Gagal suspend partner"
        });
    } finally {
        connection.release();
    }
};

// Reactivate suspended partner
exports.reactivatePartner = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const partnerId = req.params.id;

        const [partners] = await connection.query(
            "SELECT outlet_id FROM partner_profiles WHERE id = ? AND status = 'suspended'",
            [partnerId]
        );

        if (partners.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Partner tidak ditemukan atau tidak dalam status suspended"
            });
        }

        // Update partner status
        await connection.query(
            "UPDATE partner_profiles SET status = 'approved' WHERE id = ?",
            [partnerId]
        );

        // Reactivate outlet
        await connection.query(
            "UPDATE outlets SET is_active = 1 WHERE id = ?",
            [partners[0].outlet_id]
        );

        await connection.commit();

        return res.json({
            success: true,
            message: "Partner diaktifkan kembali"
        });

    } catch (err) {
        await connection.rollback();
        console.error("reactivatePartner error:", err);
        return res.status(500).json({
            success: false,
            message: "Gagal mengaktifkan partner"
        });
    } finally {
        connection.release();
    }
};
