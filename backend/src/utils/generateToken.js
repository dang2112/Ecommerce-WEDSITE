const jwt = require("jsonwebtoken");
module.exports = (user) =>
  jwt.sign(
    { user_id: user.user_id, role: user.role, full_name: user.full_name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );