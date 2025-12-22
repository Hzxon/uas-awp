const express = require("express");
const router = express.Router();
const outletItemController = require("../controllers/outletItemController");
const { verifyToken } = require("../middleware/auth");

// Public route - get items for an outlet
router.get("/outlet/:outletId", outletItemController.listByOutlet);

// Partner routes - require authentication
router.get("/my", verifyToken, outletItemController.listOwn);
router.post("/", verifyToken, outletItemController.create);
router.put("/:id", verifyToken, outletItemController.update);
router.delete("/:id", verifyToken, outletItemController.remove);

module.exports = router;
