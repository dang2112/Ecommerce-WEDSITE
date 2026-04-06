const router = require("express").Router();
const c = require("../controllers/order.controller");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/addresses", protect, c.getCheckoutAddresses);
router.post("/checkout", protect, c.checkout);
router.get("/my", protect, c.getMyOrders);
router.get("/", protect, adminOnly, c.getAllOrders);
router.patch("/:id/status", protect, adminOnly, c.updateOrderStatus);

module.exports = router;
