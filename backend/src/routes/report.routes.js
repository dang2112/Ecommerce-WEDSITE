const router = require("express").Router();
const c = require("../controllers/report.controller");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/revenue", protect, adminOnly, c.revenue);
router.get("/top-products", protect, adminOnly, c.topProducts);
router.get("/inventory", protect, adminOnly, c.inventory);

module.exports = router;
