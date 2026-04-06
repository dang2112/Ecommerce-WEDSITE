const router = require("express").Router();
const c = require("../controllers/payment.controller");
const { protect } = require("../middleware/auth");

router.post("/mock-success", protect, c.mockSuccess);

module.exports = router;