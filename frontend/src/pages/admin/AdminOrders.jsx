import { useEffect, useState } from "react";
import client from "../../api/client";

const statuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      setOrders((await client.get("/orders")).data);
    } catch (e) {
      setError(e.response?.data?.message || "Không tải được đơn hàng");
    }
  };
  useEffect(() => {
    load();
  }, []);

  const update = async (id, status) => {
    try {
      setError("");
      await client.patch(`/orders/${id}/status`, { status });
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Không cập nhật được trạng thái");
    }
  };

  return (
    <div className="card">
      <p className="section-label">Thao tác quản trị</p>
      <h3>Quản lý đơn hàng</h3>
      {error && <p className="error-text">{error}</p>}
      {orders.map((o) => (
        <div key={o.order_id} className="row">
          <div>
            <strong>
              #{o.order_number} - {o.full_name}
            </strong>
            <p className="meta-line">
              {o.phone_number} |{" "}
              {Number(o.total_amount).toLocaleString("vi-VN")} VND
            </p>
          </div>
          <select
            value={o.status}
            onChange={(e) => update(o.order_id, e.target.value)}
          >
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
