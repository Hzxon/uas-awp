const router = require("express").Router();
const { verifyToken } = require("../middleware/auth");
const { createMockPayment, confirmMockPayment, downloadInvoice } = require("../controllers/paymentController");

router.post("/mock", verifyToken, createMockPayment);
router.post("/mock/confirm", verifyToken, confirmMockPayment);
router.get("/invoice/:id", verifyToken, downloadInvoice);

module.exports = router;
