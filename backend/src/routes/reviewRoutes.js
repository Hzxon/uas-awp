const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { verifyToken } = require("../middleware/auth");
const { requirePartner } = require("../middleware/roleCheck");

// Public routes
router.get("/outlet/:outletId", reviewController.getOutletReviews);

// Customer routes (requires login)
router.post("/", verifyToken, reviewController.createReview);
router.get("/my", verifyToken, reviewController.getMyReviews);
router.get("/can-review/:orderId", verifyToken, reviewController.canReviewOrder);

// Partner routes (requires partner role)
router.post("/:id/reply", verifyToken, requirePartner, reviewController.replyToReview);

module.exports = router;
