const router = require("express").Router();
const { verifyToken, requireAdmin } = require("../middleware/auth");
const { listPublic, listAdmin, create, update, remove } = require("../controllers/outletController");

// Public list
router.get("/", listPublic);

// Admin operations
router.get("/admin/all", verifyToken, requireAdmin, listAdmin);
router.post("/", verifyToken, requireAdmin, create);
router.put("/:id", verifyToken, requireAdmin, update);
router.delete("/:id", verifyToken, requireAdmin, remove);

module.exports = router;
