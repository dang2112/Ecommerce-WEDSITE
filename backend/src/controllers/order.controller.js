const db = require("../config/db");

exports.checkout = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const userId = req.user.user_id;
    const {
      items,
      coupon_code,
      shipping_method = "Standard",
      address_id,
      shipping_address,
      payment_method = "COD",
    } = req.body;
    const normalizedCouponCode = coupon_code?.trim() || null;

    if (!items || !items.length)
      return res.status(400).json({ message: "Giỏ hàng trống" });
    await conn.beginTransaction();

    let resolvedAddressId = address_id;

    const [addressRows] = await conn.query(
      "SELECT address_id FROM addresses WHERE user_id=? ORDER BY address_id DESC",
      [userId],
    );
    if (resolvedAddressId) {
      const [selected] = await conn.query(
        "SELECT * FROM addresses WHERE address_id=? AND user_id=?",
        [resolvedAddressId, userId],
      );
      if (!selected.length) {
        throw new Error("Địa chỉ giao hàng không hợp lệ");
      }
    } else if (
      shipping_address?.province &&
      shipping_address?.ward &&
      shipping_address?.detail_address
    ) {
      const [created] = await conn.query(
        "INSERT INTO addresses (user_id, province, ward, detail_address) VALUES (?, ?, ?, ?)",
        [
          userId,
          shipping_address.province,
          shipping_address.ward,
          shipping_address.detail_address,
        ],
      );
      resolvedAddressId = created.insertId;
    } else if (!addressRows.length) {
      throw new Error("Vui lòng chọn hoặc nhập địa chỉ giao hàng");
    } else {
      resolvedAddressId = addressRows[0].address_id;
    }

    const shippingFees = {
      Standard: 30000,
      Express: 50000,
      SameDay: 70000,
    };
    const shipping_fee = shippingFees[shipping_method] ?? 30000;

    let subTotal = 0;
    for (const item of items) {
      const [vRows] = await conn.query(
        "SELECT price, stock_quantity FROM product_variants WHERE variant_id=?",
        [item.variant_id],
      );
      if (!vRows.length)
        throw new Error(`Variant ${item.variant_id} không tồn tại`);
      const v = vRows[0];
      if (v.stock_quantity < item.quantity)
        throw new Error(`Variant ${item.variant_id} không đủ tồn kho`);
      subTotal += Number(v.price) * Number(item.quantity);
    }

    let discount = 0;
    if (normalizedCouponCode) {
      const [couponRows] = await conn.query(
        "SELECT * FROM coupons WHERE code=?",
        [normalizedCouponCode],
      );
      if (!couponRows.length) {
        throw new Error("Mã giảm giá không tồn tại");
      }

      const coupon = couponRows[0];
      const now = new Date();
      const startDate = new Date(coupon.start_date);
      const endDate = new Date(coupon.end_date);
      if (now < startDate || now > endDate) {
        throw new Error("Mã giảm giá đã hết hạn");
      }

      discount = Number(coupon.discount_value || 0);
      if (coupon.maximum_discount != null) {
        discount = Math.min(discount, Number(coupon.maximum_discount));
      }
    }

    const orderNumber = `ORD-${Date.now()}`;
    const [orderRes] = await conn.query(
      `INSERT INTO orders (user_id, coupon_code, order_number, status, sub_total, discount_amount, shipping_fee)
       VALUES (?, ?, ?, 'Pending', ?, ?, ?)`,
      [
        userId,
        normalizedCouponCode,
        orderNumber,
        subTotal,
        discount,
        shipping_fee,
      ],
    );
    const orderId = orderRes.insertId;

    for (const item of items) {
      const [vRows] = await conn.query(
        "SELECT price FROM product_variants WHERE variant_id=?",
        [item.variant_id],
      );
      const price = vRows[0].price;

      await conn.query(
        "INSERT INTO order_items (order_id, variant_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
        [orderId, item.variant_id, item.quantity, price],
      );
      await conn.query(
        "UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE variant_id=?",
        [item.quantity, item.variant_id],
      );
    }

    const carrierMap = {
      Standard: "VNPost",
      Express: "GHN",
      SameDay: "Ahamove",
    };
    await conn.query(
      "INSERT INTO shipments (tracking_number, order_id, carrier, shipping_method, shipping_status) VALUES (?, ?, ?, ?, 'Preparing')",
      [
        `TRK-${Date.now()}`,
        orderId,
        carrierMap[shipping_method] || "VNPost",
        shipping_method,
      ],
    );

    const paymentStatus = payment_method === "COD" ? "Pending" : "Pending";
    await conn.query(
      "INSERT INTO payments (transaction_id, order_id, payment_method, status) VALUES (?, ?, ?, ?)",
      [`TXN-${Date.now()}`, orderId, payment_method, paymentStatus],
    );

    await conn.commit();
    res.status(201).json({
      message: "Đặt hàng thành công",
      order_id: orderId,
      order_number: orderNumber,
    });
  } catch (e) {
    await conn.rollback();
    res.status(400).json({ message: e.message });
  } finally {
    conn.release();
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      "SELECT * FROM orders WHERE user_id=? ORDER BY order_id DESC",
      [req.user.user_id],
    );
    res.json(orders);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getAllOrders = async (_, res) => {
  try {
    const [rows] = await db.query(
      `SELECT o.*, u.full_name, u.phone_number
       FROM orders o JOIN users u ON o.user_id = u.user_id
       ORDER BY o.order_id DESC`,
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getCheckoutAddresses = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT address_id, province, ward, detail_address FROM addresses WHERE user_id=? ORDER BY address_id DESC",
      [req.user.user_id],
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }
    const [r] = await db.query("UPDATE orders SET status=? WHERE order_id=?", [
      status,
      id,
    ]);
    if (!r.affectedRows)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    res.json({ message: "Cập nhật trạng thái thành công" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
