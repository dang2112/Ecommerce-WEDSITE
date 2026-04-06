const db = require("../config/db");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

exports.register = async (req, res) => {
  try {
    const { phone_number, password, full_name, gender } = req.body;
    if (!phone_number || !password || !full_name)
      return res.status(400).json({ message: "Thiếu thông tin" });

    const [exist] = await db.query("SELECT user_id FROM users WHERE phone_number=?", [phone_number]);
    if (exist.length) return res.status(409).json({ message: "Số điện thoại đã tồn tại" });

    const hashed = await bcrypt.hash(password, 10);

    const [r] = await db.query(
      "INSERT INTO users (phone_number, password, full_name, gender, role) VALUES (?, ?, ?, ?, 'Customer')",
      [phone_number, hashed, full_name, gender || null]
    );

    const user = { user_id: r.insertId, role: "Customer", full_name };
    const token = generateToken(user);
    res.status(201).json({ token, user });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone_number, password } = req.body;
    const [rows] = await db.query("SELECT * FROM users WHERE phone_number=?", [phone_number]);
    if (!rows.length) return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });

    const token = generateToken(user);
    res.json({
      token,
      user: { user_id: user.user_id, full_name: user.full_name, role: user.role, phone_number: user.phone_number }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};