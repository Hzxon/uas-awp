/**
 * Role-based access control middleware
 * Use after verifyToken middleware
 */

const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Insufficient permissions."
            });
        }

        next();
    };
};

const requireAdmin = requireRole('admin', 'superadmin');
const requireSuperAdmin = requireRole('superadmin');
const requirePartner = requireRole('partner', 'admin', 'superadmin');
const requireCustomer = requireRole('customer', 'partner', 'admin', 'superadmin');

module.exports = {
    requireRole,
    requireAdmin,
    requireSuperAdmin,
    requirePartner,
    requireCustomer
};
