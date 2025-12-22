const express = require("express");
const router = express.Router();
const adminPartnerController = require("../controllers/adminPartnerController");
const { verifyToken } = require("../middleware/auth");
const { requireAdmin, requireSuperAdmin } = require("../middleware/roleCheck");

// All routes require authentication
router.use(verifyToken);

// Static routes MUST come before dynamic :id routes
// Get list of admin users for owner selection
router.get("/admins/list", requireSuperAdmin, adminPartnerController.listAdminUsers);

// List all partners
router.get("/", requireAdmin, adminPartnerController.listPartners);

// Create new partner
router.post("/", requireSuperAdmin, adminPartnerController.createPartner);

// Dynamic :id routes
router.get("/:id", requireAdmin, adminPartnerController.getPartner);
router.post("/:id/approve", requireSuperAdmin, adminPartnerController.approvePartner);
router.post("/:id/reject", requireSuperAdmin, adminPartnerController.rejectPartner);
router.post("/:id/suspend", requireSuperAdmin, adminPartnerController.suspendPartner);
router.post("/:id/reactivate", requireSuperAdmin, adminPartnerController.reactivatePartner);

module.exports = router;

