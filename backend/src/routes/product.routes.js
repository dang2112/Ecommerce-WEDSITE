const router = require("express").Router();
const c = require("../controllers/product.controller");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/", c.getProducts);
router.get("/:id", c.getProductById);
router.post("/", protect, adminOnly, c.createProduct);
router.put("/:id", protect, adminOnly, c.updateProduct);
router.delete("/:id", protect, adminOnly, c.deleteProduct);

module.exports = router;
