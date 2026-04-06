const db = require("../config/db");

exports.getProducts = async (req, res) => {
  try {
    const {
      q = "",
      minPrice = 0,
      maxPrice = 99999999,
      category,
      size,
    } = req.query;
    let sql = `
      SELECT
        p.product_id,
        p.name,
        p.description,
        p.brand,
        p.category,
        p.base_price,
        p.image_url,
        COUNT(DISTINCT pv.variant_id) AS variant_count,
        COALESCE(MIN(pv.price), p.base_price) AS price
      FROM products p
      LEFT JOIN product_variants pv ON p.product_id = pv.product_id
      WHERE (p.name LIKE ? OR p.brand LIKE ? OR p.category LIKE ?)
    `;
    const params = [`%${q}%`, `%${q}%`, `%${q}%`];

    sql += `
      AND EXISTS (
        SELECT 1
        FROM product_variants pvf
        WHERE pvf.product_id = p.product_id
          AND pvf.price BETWEEN ? AND ?
    `;
    params.push(Number(minPrice), Number(maxPrice));

    if (category) {
      sql += " AND p.category = ?";
      params.push(category);
    }
    if (size) {
      sql += " AND pvf.size = ?";
      params.push(size);
    }

    sql += `
      )
      GROUP BY p.product_id, p.name, p.description, p.brand, p.category, p.base_price, p.image_url
      ORDER BY p.product_id DESC
    `;

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const [productRows] = await db.query(
      `SELECT product_id, name, description, brand, category, base_price, image_url
       FROM products
       WHERE product_id=?`,
      [id],
    );

    if (!productRows.length) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const [variantRows] = await db.query(
      `SELECT variant_id, product_id, size, stock_quantity, price, image_url
       FROM product_variants
       WHERE product_id=?
       ORDER BY variant_id ASC`,
      [id],
    );

    res.json({ ...productRows[0], variants: variantRows });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.createProduct = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const {
      name,
      description,
      brand,
      category,
      image_url,
      base_price,
      variants = [],
    } = req.body;
    if (!name || !base_price || !image_url || !variants.length) {
      return res
        .status(400)
        .json({ message: "Thiếu thông tin sản phẩm/biến thể" });
    }

    await conn.beginTransaction();
    const [r] = await conn.query(
      "INSERT INTO products (name, description, brand, category, image_url, base_price) VALUES (?, ?, ?, ?, ?, ?)",
      [
        name,
        description || null,
        brand || null,
        category || null,
        image_url,
        base_price,
      ],
    );
    const productId = r.insertId;

    for (const v of variants) {
      await conn.query(
        "INSERT INTO product_variants (product_id, size, stock_quantity, price, image_url) VALUES (?, ?, ?, ?, ?)",
        [
          productId,
          v.size || null,
          v.stock_quantity || 0,
          v.price,
          v.image_url || image_url,
        ],
      );
    }

    await conn.commit();
    res
      .status(201)
      .json({ message: "Thêm sản phẩm thành công", product_id: productId });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ message: e.message });
  } finally {
    conn.release();
  }
};

exports.updateProduct = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { id } = req.params;
    const {
      name,
      description,
      brand,
      category,
      image_url,
      base_price,
      variants,
    } = req.body;

    await conn.beginTransaction();

    const [r] = await conn.query(
      "UPDATE products SET name=?, description=?, brand=?, category=?, image_url=?, base_price=? WHERE product_id=?",
      [
        name,
        description || null,
        brand || null,
        category || null,
        image_url,
        base_price,
        id,
      ],
    );
    if (!r.affectedRows) {
      throw new Error("Sản phẩm không tồn tại");
    }

    if (Array.isArray(variants)) {
      const [existingVariants] = await conn.query(
        "SELECT variant_id FROM product_variants WHERE product_id=?",
        [id],
      );
      const existingVariantIds = new Set(
        existingVariants.map((variant) => variant.variant_id),
      );
      const incomingVariantIds = new Set();

      for (const variant of variants) {
        if (
          !variant.size &&
          !variant.price &&
          !variant.stock_quantity &&
          !variant.image_url
        ) {
          continue;
        }

        const normalizedVariant = {
          size: variant.size || null,
          stock_quantity: Math.max(0, Number(variant.stock_quantity) || 0),
          price: Number(variant.price),
          image_url: variant.image_url || image_url,
        };

        if (!normalizedVariant.price || normalizedVariant.price <= 0) {
          throw new Error("Giá biến thể phải lớn hơn 0");
        }

        if (variant.variant_id) {
          const variantId = Number(variant.variant_id);
          incomingVariantIds.add(variantId);
          if (!existingVariantIds.has(variantId)) {
            throw new Error("Biến thể không tồn tại");
          }

          await conn.query(
            "UPDATE product_variants SET size=?, stock_quantity=?, price=?, image_url=? WHERE variant_id=? AND product_id=?",
            [
              normalizedVariant.size,
              normalizedVariant.stock_quantity,
              normalizedVariant.price,
              normalizedVariant.image_url,
              variantId,
              id,
            ],
          );
        } else {
          await conn.query(
            "INSERT INTO product_variants (product_id, size, stock_quantity, price, image_url) VALUES (?, ?, ?, ?, ?)",
            [
              id,
              normalizedVariant.size,
              normalizedVariant.stock_quantity,
              normalizedVariant.price,
              normalizedVariant.image_url,
            ],
          );
        }
      }

      for (const existingVariantId of existingVariantIds) {
        if (incomingVariantIds.has(existingVariantId)) continue;

        const [used] = await conn.query(
          "SELECT 1 FROM order_items WHERE variant_id=? LIMIT 1",
          [existingVariantId],
        );

        if (used.length) {
          throw new Error(
            "Có biến thể đã phát sinh trong đơn hàng, không thể xóa biến thể này.",
          );
        }

        await conn.query("DELETE FROM product_variants WHERE variant_id=?", [
          existingVariantId,
        ]);
      }
    }

    await conn.commit();
    res.json({ message: "Cập nhật sản phẩm thành công" });
  } catch (e) {
    await conn.rollback();
    const status = e.message === "Sản phẩm không tồn tại" ? 404 : 500;
    res.status(status).json({ message: e.message });
  } finally {
    conn.release();
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const [used] = await db.query(
      `SELECT 1 FROM order_items oi
       JOIN product_variants pv ON oi.variant_id = pv.variant_id
       WHERE pv.product_id=? LIMIT 1`,
      [id],
    );
    if (used.length) {
      return res.status(409).json({
        message:
          "Sản phẩm đã có trong đơn hàng, không xóa cứng được (nên chuyển ngừng kinh doanh).",
      });
    }
    const [r] = await db.query("DELETE FROM products WHERE product_id=?", [id]);
    if (!r.affectedRows) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
    res.json({ message: "Xóa sản phẩm thành công" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
