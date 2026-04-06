const db = require("../config/db");

exports.mockSuccess = async (req, res) => {
  try {
    const { order_id } = req.body;
    await db.query("UPDATE payments SET status='Completed', payment_date=NOW() WHERE order_id=?", [order_id]);
    await db.query("UPDATE orders SET status='Processing' WHERE order_id=?", [order_id]);
    res.json({ message: "Thanh toán mô phỏng thành công" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};