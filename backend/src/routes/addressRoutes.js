const router = require("express").Router();
const { verifyToken } = require("../middleware/auth");
const { createAddress, listAddresses, updateAddress, deleteAddress } = require("../controllers/addressController");

router.use(verifyToken);
router.get("/", listAddresses);
router.post("/", createAddress);
router.put("/:id", updateAddress);
router.delete("/:id", deleteAddress);

module.exports = router;
