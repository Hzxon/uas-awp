const router = require("express").Router(); 
const express = require("express");
const { createOrder, listOrders } = require("../controllers/orderController");

router.post("/", createOrder);
router.get("/", listOrders);

module.exports = router;
