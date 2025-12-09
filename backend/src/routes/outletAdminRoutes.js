const router = require("express").Router();
const { verifyToken } = require("../middleware/auth");
const { listForUser, updateForUser } = require("../controllers/outletAdminController");

router.use(verifyToken);
router.get("/", listForUser);
router.put("/:id", updateForUser);

module.exports = router;
