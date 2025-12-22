const pool = require("../config/db");
const bcrypt = require("bcrypt");

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

// Create new partner directly (superadmin only)
exports.createPartner = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const adminId = req.user.id;
        const {
            nama,
            email,
            password,
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
        if (!nama || !email || !password || !business_name || !outlet_name || !outlet_address) {
            return res.status(400).json({
                success: false,
                message: "Nama, email, password, nama bisnis, nama outlet, dan alamat outlet wajib diisi"
            });
        }

        // Check if email already exists
        const [existingUser] = await connection.query(
            "SELECT id FROM users WHERE email = ?",
            [email.toLowerCase().trim()]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email sudah terdaftar"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with admin role (partners get admin role)
        const [userResult] = await connection.query(
            `INSERT INTO users (nama, email, password, role) 
             VALUES (?, ?, ?, 'admin')`,
            [nama, email.toLowerCase().trim(), hashedPassword]
        );

        const userId = userResult.insertId;

        // Create outlet for the partner (active from start)
        const [outletResult] = await connection.query(
            `INSERT INTO outlets (nama, alamat, lat, lng, phone, description, owner_id, is_active, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
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

        // Create partner profile with approved status
        await connection.query(
            `INSERT INTO partner_profiles 
             (user_id, outlet_id, business_name, business_license, bank_name, bank_account, bank_holder, status, approved_at, approved_by, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'approved', NOW(), ?, NOW())`,
            [
                userId,
                outletId,
                business_name,
                business_license || "",
                bank_name || "",
                bank_account || "",
                bank_holder || "",
                adminId
            ]
        );

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Partner berhasil dibuat dan diaktifkan"
        });

    } catch (err) {
        await connection.rollback();
        console.error("createPartner error:", err);
        return res.status(500).json({
            success: false,
            message: "Gagal membuat partner"
        });
    } finally {
        connection.release();
    }
};

// List admin users for owner selection dropdown
exports.listAdminUsers = async (req, res) => {
    try {
        const [admins] = await pool.query(`
            SELECT id, nama, email, role 
            FROM users 
            WHERE role IN ('admin', 'superadmin')
            ORDER BY nama ASC
        `);

        return res.json({
            success: true,
            admins: admins
        });
    } catch (err) {
        console.error("listAdminUsers error:", err);
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil daftar admin"
        });
    }
};
