const router = require("express").Router();
const express = require("express");
const { createOrder, listOrders, getOrder, listAllOrders } = require("../controllers/orderController");
const { verifyToken, requireAdmin } = require("../middleware/auth");

router.post("/", createOrder);
router.get("/admin/all", verifyToken, requireAdmin, listAllOrders);
router.get("/", listOrders);
router.get("/:id", getOrder);

module.exports = router;
