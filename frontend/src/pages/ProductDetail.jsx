import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import client from "../api/client";
import { useCart } from "../context/CartContext";
import { FiArrowLeft, FiShoppingBag } from "react-icons/fi";

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await client.get(`/products/${id}`);
        if (!mounted) return;
        setProduct(res.data);
        const firstVariant = res.data.variants?.[0];
        setSelectedSize(firstVariant?.size || "");
      } catch (err) {
        if (!mounted) return;
        setError(
          err.response?.data?.message || "Không thể tải chi tiết sản phẩm",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProduct();
    return () => {
      mounted = false;
    };
  }, [id]);

  const sizes = useMemo(() => {
    return [
      ...new Set(
        (product?.variants || [])
          .map((variant) => variant.size)
          .filter(Boolean),
      ),
    ];
  }, [product]);

  const variantImages = useMemo(() => {
    return (product?.variants || []).filter((variant) => variant.image_url);
  }, [product]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return null;
    return (
      product.variants.find((variant) => variant.size === selectedSize) ||
      product.variants[0]
    );
  }, [product, selectedSize]);

  useEffect(() => {
    if (!selectedVariant) return;
    setSelectedSize(selectedVariant.size || "");
  }, [selectedVariant?.variant_id]);

  useEffect(() => {
    if (!successMessage) return;
    const timeoutId = setTimeout(() => setSuccessMessage(""), 1800);
    return () => clearTimeout(timeoutId);
  }, [successMessage]);

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addToCart({
      ...selectedVariant,
      name: product.name,
      image_url: selectedVariant.image_url || product.image_url,
      brand: product.brand,
      category: product.category,
    });
    setSuccessMessage("Đã thêm vào giỏ hàng thành công");
  };

  if (loading) {
    return (
      <section className="card detail-loading">
        <p className="section-label">Đang tải</p>
        <h3>Đang lấy thông tin sản phẩm...</h3>
      </section>
    );
  }

  if (error) {
    return (
      <section className="card empty-state">
        <p className="error-text">{error}</p>
        <Link className="btn" to="/">
          <FiArrowLeft /> Quay lại danh sách
        </Link>
      </section>
    );
  }

  if (!product) return null;

  return (
    <section className="product-detail">
      {successMessage && (
        <div className="toast-notice" role="status" aria-live="polite">
          {successMessage}
        </div>
      )}

      <Link className="inline-links back-link" to="/">
        <FiArrowLeft /> Quay lại danh sách
      </Link>

      <div className="product-detail-layout">
        <div className="card product-detail-media">
          <img
            className="product-detail-image"
            src={selectedVariant?.image_url || product.image_url}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80&auto=format&fit=crop";
            }}
          />
          {variantImages.length > 1 && (
            <div className="variant-gallery">
              {variantImages.map((variant) => (
                <button
                  key={variant.variant_id}
                  type="button"
                  className={
                    variant.variant_id === selectedVariant?.variant_id
                      ? "variant-thumb active"
                      : "variant-thumb"
                  }
                  onClick={() => setSelectedSize(variant.size)}
                  aria-label={`Xem ảnh biến thể size ${variant.size}`}
                >
                  <img
                    src={variant.image_url}
                    alt={`${product.name} - size ${variant.size}`}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80&auto=format&fit=crop";
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card product-detail-info">
          <p className="section-label">
            {product.brand || "Chưa có thương hiệu"}
          </p>
          <h2>{product.name}</h2>
          <p className="meta-line meta-pill">
            {product.category || "Chưa phân loại"}
          </p>
          <p>{product.description}</p>

          <div className="detail-meta">
            <span className="meta-line">
              Size: {selectedVariant?.size || "-"}
            </span>
            <span className="meta-line">
              Tồn kho: {selectedVariant?.stock_quantity ?? 0}
            </span>
          </div>

          <div className="detail-option-group">
            <p className="detail-option-label">Chọn size</p>
            <div className="option-chip-row">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={
                    size === selectedSize ? "option-chip active" : "option-chip"
                  }
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="detail-price-row">
            <strong>
              {Number(
                selectedVariant?.price || product.base_price,
              ).toLocaleString("vi-VN")}{" "}
              VND
            </strong>
            <button
              className="btn"
              onClick={handleAddToCart}
              disabled={!selectedVariant || !selectedVariant.stock_quantity}
            >
              <FiShoppingBag /> Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
