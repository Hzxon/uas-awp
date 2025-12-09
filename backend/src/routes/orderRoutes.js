const router = require("express").Router(); 
const express = require("express");
const { createOrder, listOrders, getOrder, listAllOrders } = require("../controllers/orderController");
const { requireAdmin } = require("../middleware/auth");

router.post("/", createOrder);
router.get("/admin/all", requireAdmin, listAllOrders);
router.get("/", listOrders);
router.get("/:id", getOrder);

module.exports = router;
