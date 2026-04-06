const db = require("../config/db");

exports.revenue = async (req, res) => {
  try {
    const today = new Date();
    const to = req.query.to || today.toISOString().slice(0, 10);
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const from = req.query.from || firstDay;
    const [rows] = await db.query(
      `SELECT DATE(order_date) AS day, SUM(total_amount) AS revenue, COUNT(*) AS total_orders
       FROM orders
       WHERE status IN ('Processing', 'Shipped', 'Delivered')
         AND DATE(order_date) BETWEEN ? AND ?
       GROUP BY DATE(order_date)
       ORDER BY day`,
      [from, to],
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.topProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 10);
    const [rows] = await db.query(
      `SELECT p.product_id, p.name, p.category, p.brand,
              SUM(oi.quantity) AS total_sold,
              SUM(oi.quantity * oi.unit_price) AS revenue
       FROM order_items oi
       JOIN product_variants pv ON oi.variant_id = pv.variant_id
       JOIN products p ON pv.product_id = p.product_id
       GROUP BY p.product_id, p.name, p.category, p.brand
       ORDER BY total_sold DESC
       LIMIT ?`,
      [limit],
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.inventory = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.product_id, p.name, p.category, p.brand,
              SUM(pv.stock_quantity) AS total_stock,
              COUNT(pv.variant_id) AS variant_count
       FROM products p
       LEFT JOIN product_variants pv ON p.product_id = pv.product_id
       GROUP BY p.product_id, p.name, p.category, p.brand
       ORDER BY total_stock ASC, p.product_id DESC`,
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
