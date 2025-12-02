const express = require("express");
const { createOrder, listOrders } = require("../controllers/orderController");

const router = express.Router();

router.post("/", createOrder);
router.get("/", listOrders);

module.exports = router;
