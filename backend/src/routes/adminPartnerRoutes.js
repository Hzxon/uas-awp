const express = require("express");
const router = express.Router();
const adminPartnerController = require("../controllers/adminPartnerController");
const { verifyToken } = require("../middleware/auth");
const { requireAdmin, requireSuperAdmin } = require("../middleware/roleCheck");

// All routes require authentication
router.use(verifyToken);

// Read routes - all admins can view
router.get("/", requireAdmin, adminPartnerController.listPartners);
router.get("/:id", requireAdmin, adminPartnerController.getPartner);

// Write routes - only superadmin can modify
router.post("/:id/approve", requireSuperAdmin, adminPartnerController.approvePartner);
router.post("/:id/reject", requireSuperAdmin, adminPartnerController.rejectPartner);
router.post("/:id/suspend", requireSuperAdmin, adminPartnerController.suspendPartner);
router.post("/:id/reactivate", requireSuperAdmin, adminPartnerController.reactivatePartner);

module.exports = router;
