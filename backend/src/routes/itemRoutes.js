const express = require("express");
const { listItems, getItem, createItem, updateItem, deleteItem } = require("../controllers/itemController");
const { verifyToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", listItems);
router.get("/:id", getItem);

router.post("/", verifyToken, requireAdmin, createItem);
router.patch("/:id", verifyToken, requireAdmin, updateItem);
router.delete("/:id", verifyToken, requireAdmin, deleteItem);

module.exports = router;
