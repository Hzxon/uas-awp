const express = require("express");
const router = express.Router();
const partnerController = require("../controllers/partnerController");
const { verifyToken } = require("../middleware/auth");
const { requirePartner } = require("../middleware/roleCheck");

// Public route - any logged in user can apply to become partner
router.post("/register", verifyToken, partnerController.registerPartner);

// Partner-only routes
router.get("/profile", verifyToken, requirePartner, partnerController.getPartnerProfile);
router.put("/profile", verifyToken, requirePartner, partnerController.updatePartnerProfile);
router.get("/dashboard", verifyToken, requirePartner, partnerController.getPartnerDashboard);
router.get("/orders", verifyToken, requirePartner, partnerController.getPartnerOrders);
router.put("/orders/:id/status", verifyToken, requirePartner, partnerController.updateOrderStatus);

module.exports = router;
