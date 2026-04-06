import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

export default function Cart() {
  const { items, setItems } = useCart();
  const total = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);

  const inc = (id) =>
    setItems(
      items.map((i) =>
        i.variant_id === id ? { ...i, quantity: i.quantity + 1 } : i,
      ),
    );
  const dec = (id) =>
    setItems(
      items
        .map((i) =>
          i.variant_id === id ? { ...i, quantity: i.quantity - 1 } : i,
        )
        .filter((i) => i.quantity >= 1),
    );

  if (!items.length) {
    return (
      <section className="card empty-state">
        <h3>Giỏ hàng đang trống</h3>
        <p>
          Bạn chưa thêm sản phẩm nào. Hãy quay lại danh sách sản phẩm để tiếp
          tục mua sắm.
        </p>
        <Link className="btn" to="/">
          Mua ngay
        </Link>
      </section>
    );
  }

  return (
    <section className="card">
      <h3>Giỏ hàng của bạn</h3>
      {items.map((i) => (
        <div key={i.variant_id} className="row">
          <div>
            <strong>{i.name}</strong>
            <p className="meta-line">
              {i.size} | {Number(i.price).toLocaleString("vi-VN")} VND
            </p>
          </div>
          <div className="qty-box">
            <button
              className="btn btn-secondary"
              onClick={() => dec(i.variant_id)}
            >
              -
            </button>
            <span>{i.quantity}</span>
            <button
              className="btn btn-secondary"
              onClick={() => inc(i.variant_id)}
            >
              +
            </button>
          </div>
        </div>
      ))}

      <div className="checkout-bar">
        <h4>Tổng: {total.toLocaleString("vi-VN")} VND</h4>
        <Link className="btn" to="/checkout">
          Thanh toán
        </Link>
      </div>
    </section>
  );
}
