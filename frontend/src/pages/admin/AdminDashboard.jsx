import { useEffect, useState } from "react";
import client from "../../api/client";
import { FiBarChart2, FiBox, FiTrendingUp } from "react-icons/fi";

export default function AdminDashboard() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [from, setFrom] = useState("2026-01-01");
  const [to, setTo] = useState("2026-12-31");
  const [reportType, setReportType] = useState("revenue");

  const load = async () => {
    try {
      setError("");
      const endpointMap = {
        revenue: "/reports/revenue",
        topProducts: "/reports/top-products",
        inventory: "/reports/inventory",
      };
      const params = reportType === "revenue" ? { from, to } : {};
      const res = await client.get(endpointMap[reportType], { params });
      setRows(res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Không tải được báo cáo");
    }
  };

  useEffect(() => {
    load();
  }, [reportType, from, to]);

  return (
    <div className="card">
      <p className="section-label">Phân tích quản trị</p>
      <h3>Bảng điều khiển doanh thu</h3>
      {error && <p className="error-text">{error}</p>}
      <div className="toolbar report-tabs">
        <button
          className={reportType === "revenue" ? "btn" : "btn btn-secondary"}
          onClick={() => setReportType("revenue")}
        >
          <FiBarChart2 /> Doanh thu
        </button>
        <button
          className={reportType === "topProducts" ? "btn" : "btn btn-secondary"}
          onClick={() => setReportType("topProducts")}
        >
          <FiTrendingUp /> Bán chạy
        </button>
        <button
          className={reportType === "inventory" ? "btn" : "btn btn-secondary"}
          onClick={() => setReportType("inventory")}
        >
          <FiBox /> Tồn kho
        </button>
      </div>
      <div className="toolbar">
        {reportType === "revenue" && (
          <>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </>
        )}
      </div>
      {rows.map((r, i) => (
        <div key={i} className="row">
          {reportType === "revenue" && (
            <>
              <span>{r.day}</span>
              <span>{Number(r.revenue).toLocaleString("vi-VN")} VND</span>
              <span>{r.total_orders} don</span>
            </>
          )}
          {reportType === "topProducts" && (
            <>
              <span>{r.name}</span>
              <span>{r.category || "Uncategorized"}</span>
              <span>{Number(r.total_sold || 0)} sp</span>
            </>
          )}
          {reportType === "inventory" && (
            <>
              <span>{r.name}</span>
              <span>{r.category || "Uncategorized"}</span>
              <span>{Number(r.total_stock || 0)} ton</span>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
