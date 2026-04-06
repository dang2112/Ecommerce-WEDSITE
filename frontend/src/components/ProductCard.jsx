import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

export default function ProductCard({ product }) {
  return (
    <article className="card product-card">
      <Link
        className="product-image-wrap product-card-link"
        to={`/products/${product.product_id}`}
      >
        <img
          className="product-image"
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=80&auto=format&fit=crop";
          }}
        />
      </Link>
      <p className="section-label">{product.brand || "Chưa có thương hiệu"}</p>
      <Link
        className="product-card-link"
        to={`/products/${product.product_id}`}
      >
        <h3>{product.name}</h3>
      </Link>
      <p className="meta-line meta-pill">
        {product.category || "Chưa phân loại"}
      </p>
      <div className="card-footer">
        <strong>{Number(product.price).toLocaleString("vi-VN")} VND</strong>
        <Link className="btn" to={`/products/${product.product_id}`}>
          <FiChevronRight /> Chi tiết
        </Link>
      </div>
    </article>
  );
}
