const router = require("express").Router();
const { verifyToken, requireAdmin } = require("../middleware/auth");
const { getTimeline, updateStatus } = require("../controllers/statusController");

router.get("/:id", verifyToken, getTimeline);
router.post("/:id", verifyToken, requireAdmin, updateStatus);

module.exports = router;
