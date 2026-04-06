import { useEffect, useState } from "react";
import client from "../api/client";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    client.get("/orders/my").then((r) => setOrders(r.data));
  }, []);

  return (
    <div className="card">
      <p className="section-label">Theo dõi đơn hàng</p>
      <h3>Đơn hàng của tôi</h3>
      {orders.map((o) => (
        <div key={o.order_id} className="row">
          <span>#{o.order_number}</span>
          <span className="status-chip">{o.status}</span>
          <span>{Number(o.total_amount).toLocaleString("vi-VN")} VND</span>
        </div>
      ))}
    </div>
  );
}
