const express = require("express");
const router = express.Router();
const adminPartnerController = require("../controllers/adminPartnerController");
const { verifyToken } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/roleCheck");

// All routes require admin role
router.use(verifyToken, requireAdmin);

router.get("/", adminPartnerController.listPartners);
router.get("/:id", adminPartnerController.getPartner);
router.post("/:id/approve", adminPartnerController.approvePartner);
router.post("/:id/reject", adminPartnerController.rejectPartner);
router.post("/:id/suspend", adminPartnerController.suspendPartner);
router.post("/:id/reactivate", adminPartnerController.reactivatePartner);

module.exports = router;
