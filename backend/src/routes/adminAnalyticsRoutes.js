const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/adminAnalyticsController");
const { verifyToken, requireAdmin } = require("../middleware/auth");

// All routes require admin
router.use(verifyToken, requireAdmin);

// Analytics endpoints
router.get("/overview", analyticsController.getOverview);
router.get("/activities", analyticsController.getRecentActivities);

module.exports = router;
