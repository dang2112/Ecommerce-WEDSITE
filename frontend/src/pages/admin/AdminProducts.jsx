import { useEffect, useState } from "react";
import client from "../../api/client";
import {
  FiEdit2,
  FiImage,
  FiPlusCircle,
  FiPlus,
  FiSave,
  FiTrash2,
  FiXCircle,
  FiX,
} from "react-icons/fi";

const categoryOptions = [
  { value: "", label: "Chọn danh mục" },
  { value: "T-Shirt", label: "Áo thun" },
  { value: "Shirt", label: "Áo sơ mi" },
  { value: "Pants", label: "Quần" },
  { value: "Shorts", label: "Quần short" },
  { value: "Jacket", label: "Áo khoác" },
  { value: "Sweater", label: "Áo len" },
  { value: "Dress", label: "Váy / Đầm" },
  { value: "Shoes", label: "Giày" },
  { value: "Bag", label: "Túi xách" },
  { value: "Accessory", label: "Phụ kiện" },
  { value: "Other", label: "Khác" },
];

const sizeOptions = ["", "S", "M", "L", "XL"];

const emptyVariant = () => ({
  variant_id: null,
  size: "",
  stock_quantity: 0,
  price: "",
  image_url: "",
});

const toEditVariant = (variant = {}) => ({
  variant_id: variant.variant_id ?? null,
  size: variant.size || "",
  stock_quantity: variant.stock_quantity ?? 0,
  price: variant.price ?? "",
  image_url: variant.image_url || "",
});

export default function AdminProducts() {
  const [list, setList] = useState([]);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [variants, setVariants] = useState([emptyVariant()]);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingBrand, setEditingBrand] = useState("");
  const [editingCategory, setEditingCategory] = useState("");
  const [editingPrice, setEditingPrice] = useState("");
  const [editingImageUrl, setEditingImageUrl] = useState("");
  const [editingVariants, setEditingVariants] = useState([]);
  const [error, setError] = useState("");

  const load = async () => setList((await client.get("/products")).data);

  useEffect(() => {
    load();
  }, []);

  const updateVariant = (index, field, value) => {
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, [field]: value } : variant,
      ),
    );
  };

  const addVariantRow = () => {
    setVariants((current) => [...current, emptyVariant()]);
  };

  const removeVariantRow = (index) => {
    setVariants((current) =>
      current.filter((_, variantIndex) => variantIndex !== index),
    );
  };

  const updateEditingVariant = (index, field, value) => {
    setEditingVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, [field]: value } : variant,
      ),
    );
  };

  const addEditingVariantRow = () => {
    setEditingVariants((current) => [...current, emptyVariant()]);
  };

  const removeEditingVariantRow = (index) => {
    setEditingVariants((current) =>
      current.filter((_, variantIndex) => variantIndex !== index),
    );
  };

  const create = async () => {
    try {
      setError("");
      const normalizedBasePrice = Number(basePrice);
      const validVariants = variants.filter(
        (variant) =>
          variant.size.trim() ||
          Number(variant.price) > 0 ||
          Number(variant.stock_quantity) > 0,
      );

      if (!name.trim() || !imageUrl.trim() || normalizedBasePrice <= 0) {
        setError("Vui lòng nhập tên, giá và liên kết ảnh hợp lệ.");
        return;
      }

      if (!validVariants.length) {
        setError("Vui lòng thêm ít nhất một biến thể hợp lệ.");
        return;
      }

      const payloadVariants = validVariants.map((variant) => ({
        size: variant.size.trim(),
        stock_quantity: Math.max(0, Number(variant.stock_quantity) || 0),
        price:
          Number(variant.price) > 0
            ? Number(variant.price)
            : normalizedBasePrice,
        image_url: variant.image_url.trim() || imageUrl,
      }));

      await client.post("/products", {
        name,
        brand,
        category,
        description,
        image_url: imageUrl,
        base_price: normalizedBasePrice,
        variants: payloadVariants,
      });

      setName("");
      setBrand("");
      setCategory("");
      setBasePrice("");
      setImageUrl("");
      setDescription("");
      setVariants([emptyVariant()]);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Không thể tạo sản phẩm");
    }
  };

  const startEdit = async (p) => {
    try {
      setError("");
      const res = await client.get(`/products/${p.product_id}`);
      const detail = res.data;
      setEditingId(detail.product_id);
      setEditingName(detail.name);
      setEditingBrand(detail.brand || "");
      setEditingCategory(detail.category || "");
      setEditingPrice(String(detail.base_price || 0));
      setEditingImageUrl(detail.image_url || "");
      setEditingVariants((detail.variants || []).map(toEditVariant));
    } catch (e) {
      setError(e.response?.data?.message || "Không thể tải chi tiết sản phẩm");
    }
  };

  const saveEdit = async () => {
    try {
      setError("");
      const validVariants = editingVariants.filter(
        (variant) =>
          variant.size.trim() ||
          Number(variant.price) > 0 ||
          Number(variant.stock_quantity) > 0 ||
          variant.image_url.trim(),
      );

      if (
        !editingName.trim() ||
        !editingImageUrl.trim() ||
        Number(editingPrice) <= 0
      ) {
        setError("Vui lòng nhập tên, giá và liên kết ảnh hợp lệ.");
        return;
      }

      if (!validVariants.length) {
        setError("Vui lòng giữ ít nhất một biến thể hợp lệ.");
        return;
      }

      await client.put(`/products/${editingId}`, {
        name: editingName,
        brand: editingBrand,
        category: editingCategory,
        image_url: editingImageUrl,
        base_price: Number(editingPrice),
        variants: validVariants.map((variant) => ({
          variant_id: variant.variant_id,
          size: variant.size.trim(),
          stock_quantity: Math.max(0, Number(variant.stock_quantity) || 0),
          price:
            Number(variant.price) > 0
              ? Number(variant.price)
              : Number(editingPrice),
          image_url: variant.image_url.trim() || editingImageUrl,
        })),
      });
      setEditingId(null);
      setEditingVariants([]);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Không thể cập nhật sản phẩm");
    }
  };

  const remove = async (id) => {
    try {
      setError("");
      await client.delete(`/products/${id}`);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Không thể xóa sản phẩm");
    }
  };

  return (
    <div className="card">
      <p className="section-label">Danh mục quản trị</p>
      <h3>Quản lý sản phẩm</h3>
      {error && <p className="error-text">{error}</p>}

      <div className="admin-create-card">
        <div className="toolbar admin-create-toolbar">
          <input
            placeholder="Tên sản phẩm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Thương hiệu"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categoryOptions.map((option) => (
              <option key={option.value || "empty"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            step="10000"
            placeholder="Giá gốc"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
          />
          <input
            placeholder="Liên kết ảnh sản phẩm"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <input
            placeholder="Mô tả sản phẩm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="variant-builder">
          <div className="variant-builder-head">
            <p className="section-label">Biến thể sản phẩm</p>
            <button className="btn btn-secondary" onClick={addVariantRow}>
              <FiPlus /> Thêm biến thể
            </button>
          </div>

          {variants.map((variant, index) => (
            <div key={index} className="variant-row">
              <select
                value={variant.size}
                onChange={(e) => updateVariant(index, "size", e.target.value)}
              >
                <option value="">Chọn size</option>
                {sizeOptions.slice(1).map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                placeholder="Tồn kho"
                value={variant.stock_quantity}
                onChange={(e) =>
                  updateVariant(index, "stock_quantity", e.target.value)
                }
              />
              <input
                type="number"
                min="0"
                step="10000"
                placeholder="Giá biến thể"
                value={variant.price}
                onChange={(e) => updateVariant(index, "price", e.target.value)}
              />
              <input
                placeholder="Ảnh biến thể"
                value={variant.image_url}
                onChange={(e) =>
                  updateVariant(index, "image_url", e.target.value)
                }
              />
              <button
                className="btn btn-ghost variant-remove"
                type="button"
                onClick={() => removeVariantRow(index)}
                disabled={variants.length === 1}
              >
                <FiX />
              </button>
            </div>
          ))}
        </div>

        <button className="btn admin-create-submit" onClick={create}>
          <FiPlusCircle /> Thêm mới
        </button>
      </div>

      {list.map((p, i) => (
        <div key={i} className="row admin-product-row">
          {editingId === p.product_id ? (
            <div className="admin-edit-panel">
              <div className="admin-edit-grid">
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  placeholder="Tên sản phẩm"
                />
                <input
                  value={editingBrand}
                  onChange={(e) => setEditingBrand(e.target.value)}
                  placeholder="Thương hiệu"
                />
                <select
                  value={editingCategory}
                  onChange={(e) => setEditingCategory(e.target.value)}
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value || "empty"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                  {editingCategory &&
                  !categoryOptions.some(
                    (option) => option.value === editingCategory,
                  ) ? (
                    <option value={editingCategory}>{editingCategory}</option>
                  ) : null}
                </select>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={editingPrice}
                  onChange={(e) => setEditingPrice(e.target.value)}
                  placeholder="Giá"
                />
                <input
                  value={editingImageUrl}
                  onChange={(e) => setEditingImageUrl(e.target.value)}
                  placeholder="Liên kết ảnh"
                />
              </div>

              <div className="variant-builder variant-builder-edit">
                <div className="variant-builder-head">
                  <p className="section-label">Sửa biến thể</p>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={addEditingVariantRow}
                  >
                    <FiPlus /> Thêm biến thể
                  </button>
                </div>

                {editingVariants.map((variant, index) => (
                  <div
                    key={variant.variant_id || index}
                    className="variant-row"
                  >
                    <select
                      value={variant.size}
                      onChange={(e) =>
                        updateEditingVariant(index, "size", e.target.value)
                      }
                    >
                      <option value="">Chọn size</option>
                      {sizeOptions.slice(1).map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="0"
                      placeholder="Tồn kho"
                      value={variant.stock_quantity}
                      onChange={(e) =>
                        updateEditingVariant(
                          index,
                          "stock_quantity",
                          e.target.value,
                        )
                      }
                    />
                    <input
                      type="number"
                      min="0"
                      step="10000"
                      placeholder="Giá biến thể"
                      value={variant.price}
                      onChange={(e) =>
                        updateEditingVariant(index, "price", e.target.value)
                      }
                    />
                    <input
                      placeholder="Ảnh biến thể"
                      value={variant.image_url}
                      onChange={(e) =>
                        updateEditingVariant(index, "image_url", e.target.value)
                      }
                    />
                    <button
                      className="btn btn-ghost variant-remove"
                      type="button"
                      onClick={() => removeEditingVariantRow(index)}
                      disabled={editingVariants.length === 1}
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="admin-product-meta">
              <div className="admin-thumb-wrap">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="admin-thumb" />
                ) : (
                  <span className="admin-thumb-fallback">
                    <FiImage />
                  </span>
                )}
              </div>
              <div>
                <strong>{p.name}</strong>
                <p className="meta-line">
                  {p.category || "Chưa phân loại"} |{" "}
                  {p.brand || "Chưa có thương hiệu"}
                </p>
                <p className="meta-line">
                  {Number(p.variant_count || 0)} biến thể
                </p>
              </div>
            </div>
          )}

          <div className="admin-actions">
            <span>{Number(p.price).toLocaleString("vi-VN")} VND</span>
            {editingId === p.product_id ? (
              <>
                <button className="btn" onClick={saveEdit}>
                  <FiSave /> Lưu
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditingId(null)}
                >
                  <FiXCircle /> Hủy
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={() => startEdit(p)}
                >
                  <FiEdit2 /> Sửa
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => remove(p.product_id)}
                >
                  <FiTrash2 /> Xóa
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
