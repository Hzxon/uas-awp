const pool = require("../config/db");

/**
 * Outlet Items Controller
 * Manages per-outlet services and products
 */

// Get items for a specific outlet (public)
exports.listByOutlet = async (req, res) => {
    try {
        const outletId = req.params.outletId;

        const [services] = await pool.query(
            "SELECT id, name as nama, price as harga, unit, description as deskripsi FROM outlet_items WHERE outlet_id = ? AND type = 'Layanan' AND is_active = 1 ORDER BY price ASC",
            [outletId]
        );

        const [products] = await pool.query(
            "SELECT id, name as nama, price as harga, unit, description as deskripsi FROM outlet_items WHERE outlet_id = ? AND type = 'Produk' AND is_active = 1 ORDER BY price ASC",
            [outletId]
        );

        return res.json({
            success: true,
            services: services,
            products: products
        });
    } catch (err) {
        console.error("listByOutlet error:", err);
        return res.status(500).json({ success: false, message: "Gagal mengambil data item" });
    }
};

// Get own outlet's items (for partner)
exports.listOwn = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get partner's outlet - handle if table doesn't exist
        let profiles = [];
        try {
            const [result] = await pool.query(
                "SELECT outlet_id FROM partner_profiles WHERE user_id = ? AND status = 'approved'",
                [userId]
            );
            profiles = result;
        } catch (err) {
            // Table might not exist - try alternative: check if user owns an outlet directly
            console.log("partner_profiles query failed:", err.message);
            try {
                const [outlets] = await pool.query(
                    "SELECT id as outlet_id FROM outlets WHERE owner_id = ?",
                    [userId]
                );
                profiles = outlets;
            } catch (e) {
                console.log("outlets owner query failed:", e.message);
            }
        }

        if (profiles.length === 0) {
            // Return empty items without error to prevent crash
            return res.json({
                success: true,
                items: [],
                outletId: null,
                message: "Tidak ada outlet terdaftar untuk akun ini"
            });
        }

        const outletId = profiles[0].outlet_id;

        // Get items - handle if table doesn't exist
        let items = [];
        try {
            const [result] = await pool.query(
                "SELECT * FROM outlet_items WHERE outlet_id = ? ORDER BY type, name",
                [outletId]
            );
            items = result;
        } catch (err) {
            console.log("outlet_items query failed:", err.message);
        }

        return res.json({
            success: true,
            items: items,
            outletId: outletId
        });
    } catch (err) {
        console.error("listOwn error:", err);
        return res.status(500).json({ success: false, message: "Gagal mengambil data item" });
    }
};

// Create new item for own outlet
exports.create = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, type, price, unit, description } = req.body;

        if (!name || !type || !price) {
            return res.status(400).json({
                success: false,
                message: "Nama, tipe, dan harga wajib diisi"
            });
        }

        if (!['Layanan', 'Produk'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Tipe harus 'Layanan' atau 'Produk'"
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
                message: "Partner belum disetujui atau tidak ditemukan"
            });
        }

        const outletId = profiles[0].outlet_id;

        await pool.query(
            "INSERT INTO outlet_items (outlet_id, name, type, price, unit, description) VALUES (?, ?, ?, ?, ?, ?)",
            [outletId, name, type, price, unit || (type === 'Layanan' ? 'kg' : 'pcs'), description || '']
        );

        return res.status(201).json({
            success: true,
            message: "Item berhasil ditambahkan"
        });
    } catch (err) {
        console.error("create item error:", err);
        return res.status(500).json({ success: false, message: "Gagal menambahkan item" });
    }
};

// Update own item
exports.update = async (req, res) => {
    try {
        const userId = req.user.id;
        const itemId = req.params.id;
        const { name, type, price, unit, description, is_active } = req.body;

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

        // Verify item belongs to partner's outlet
        const [items] = await pool.query(
            "SELECT id FROM outlet_items WHERE id = ? AND outlet_id = ?",
            [itemId, outletId]
        );

        if (items.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Item tidak ditemukan"
            });
        }

        await pool.query(
            "UPDATE outlet_items SET name = ?, type = ?, price = ?, unit = ?, description = ?, is_active = ? WHERE id = ?",
            [name, type, price, unit, description || '', is_active !== undefined ? (is_active ? 1 : 0) : 1, itemId]
        );

        return res.json({
            success: true,
            message: "Item berhasil diperbarui"
        });
    } catch (err) {
        console.error("update item error:", err);
        return res.status(500).json({ success: false, message: "Gagal memperbarui item" });
    }
};

// Delete own item
exports.remove = async (req, res) => {
    try {
        const userId = req.user.id;
        const itemId = req.params.id;

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

        // Verify item belongs to partner's outlet
        const [result] = await pool.query(
            "DELETE FROM outlet_items WHERE id = ? AND outlet_id = ?",
            [itemId, outletId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Item tidak ditemukan"
            });
        }

        return res.json({
            success: true,
            message: "Item berhasil dihapus"
        });
    } catch (err) {
        console.error("remove item error:", err);
        return res.status(500).json({ success: false, message: "Gagal menghapus item" });
    }
};
