import { useEffect, useMemo, useState } from "react";
import { useCart } from "../context/CartContext";
import client from "../api/client";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle, FiCreditCard, FiMapPin, FiTruck } from "react-icons/fi";

export default function Checkout() {
  const { items, clearCart } = useCart();
  const nav = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [addressMode, setAddressMode] = useState("saved");
  const [addressId, setAddressId] = useState("");
  const [manualAddress, setManualAddress] = useState({
    province: "",
    ward: "",
    detail_address: "",
  });
  const [shippingMethod, setShippingMethod] = useState("Standard");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [locationApiError, setLocationApiError] = useState(false);

  const shippingFee = useMemo(() => {
    if (shippingMethod === "Express") return 50000;
    if (shippingMethod === "SameDay") return 70000;
    return 30000;
  }, [shippingMethod]);

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
    [items],
  );
  const total = subtotal + shippingFee;

  useEffect(() => {
    client
      .get("/orders/addresses")
      .then((res) => {
        setAddresses(res.data);
        if (res.data.length) {
          setAddressId(String(res.data[0].address_id));
        }
      })
      .catch(() => setAddresses([]));
  }, []);

  useEffect(() => {
    if (addressMode === "saved" && !addressId && addresses.length) {
      setAddressId(String(addresses[0].address_id));
    }
  }, [addressMode, addressId, addresses]);

  useEffect(() => {
    let mounted = true;

    const loadProvinces = async () => {
      try {
        setLoadingProvinces(true);
        setLocationApiError(false);
        const res = await fetch("https://provinces.open-api.vn/api/p/");
        if (!res.ok) {
          throw new Error("Không thể tải danh sách tỉnh/thành");
        }
        const data = await res.json();
        if (!mounted) return;
        setProvinces(Array.isArray(data) ? data : []);
      } catch (_) {
        if (!mounted) return;
        setLocationApiError(true);
        setProvinces([]);
      } finally {
        if (mounted) setLoadingProvinces(false);
      }
    };

    loadProvinces();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const selectedProvince = provinces.find(
      (province) => province.name === manualAddress.province,
    );

    if (!selectedProvince) {
      setWards([]);
      return;
    }

    let mounted = true;

    const loadWardsByProvince = async () => {
      try {
        setLoadingWards(true);
        const res = await fetch(
          `https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=3`,
        );
        if (!res.ok) {
          throw new Error("Không thể tải danh sách phường/xã");
        }
        const data = await res.json();
        if (!mounted) return;

        const wardOptions = (data.districts || []).flatMap((district) =>
          (district.wards || []).map((ward) => ({
            label: `${ward.name} - ${district.name}`,
            value: ward.name,
          })),
        );

        setWards(wardOptions);
      } catch (_) {
        if (!mounted) return;
        setWards([]);
      } finally {
        if (mounted) setLoadingWards(false);
      }
    };

    loadWardsByProvince();
    return () => {
      mounted = false;
    };
  }, [manualAddress.province, provinces]);

  const placeOrder = async () => {
    try {
      setLoading(true);
      setError("");
      const payload = {
        items: items.map((i) => ({
          variant_id: i.variant_id,
          quantity: i.quantity,
        })),
        payment_method: paymentMethod,
        shipping_method: shippingMethod,
        coupon_code: couponCode || undefined,
      };

      if (addressMode === "saved") {
        payload.address_id = addressId ? Number(addressId) : undefined;
      } else {
        payload.shipping_address = manualAddress;
      }

      const res = await client.post("/orders/checkout", payload);

      if (paymentMethod !== "COD") {
        await client.post("/payments/mock-success", {
          order_id: res.data.order_id,
        });
      }

      clearCart();
      nav("/my-orders");
    } catch (e) {
      setError(e.response?.data?.message || "Không thể đặt hàng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-layout">
      <section className="card checkout-main">
        <p className="section-label">Thanh toán an toàn</p>
        <h3>Xác nhận thanh toán</h3>
        <p>
          Xác nhận đơn hàng, chọn địa chỉ giao, phương thức vận chuyển và thanh
          toán.
        </p>
        {error && <p className="error-text">{error}</p>}

        <div className="checkout-section">
          <p className="section-label">
            <FiMapPin /> Địa chỉ giao hàng
          </p>
          <div className="checkout-toggle">
            <button
              className={addressMode === "saved" ? "btn" : "btn btn-secondary"}
              onClick={() => setAddressMode("saved")}
            >
              Địa chỉ đã lưu
            </button>
            <button
              className={addressMode === "manual" ? "btn" : "btn btn-secondary"}
              onClick={() => setAddressMode("manual")}
            >
              Nhập địa chỉ mới
            </button>
          </div>
          {addressMode === "saved" ? (
            <select
              value={addressId}
              onChange={(e) => setAddressId(e.target.value)}
            >
              {addresses.length ? (
                addresses.map((addr) => (
                  <option key={addr.address_id} value={addr.address_id}>
                    {addr.province} - {addr.ward} - {addr.detail_address}
                  </option>
                ))
              ) : (
                <option value="">Chưa có địa chỉ lưu</option>
              )}
            </select>
          ) : (
            <div className="checkout-address-grid">
              {locationApiError ? (
                <>
                  <input
                    placeholder="Tỉnh/Thành phố"
                    value={manualAddress.province}
                    onChange={(e) =>
                      setManualAddress({
                        ...manualAddress,
                        province: e.target.value,
                      })
                    }
                  />
                  <input
                    placeholder="Phường/Xã"
                    value={manualAddress.ward}
                    onChange={(e) =>
                      setManualAddress({
                        ...manualAddress,
                        ward: e.target.value,
                      })
                    }
                  />
                </>
              ) : (
                <>
                  <select
                    value={manualAddress.province}
                    onChange={(e) =>
                      setManualAddress({
                        ...manualAddress,
                        province: e.target.value,
                        ward: "",
                      })
                    }
                    disabled={loadingProvinces}
                  >
                    <option value="">
                      {loadingProvinces
                        ? "Đang tải tỉnh/thành..."
                        : "Chọn Tỉnh/Thành phố"}
                    </option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.name}>
                        {province.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={manualAddress.ward}
                    onChange={(e) =>
                      setManualAddress({
                        ...manualAddress,
                        ward: e.target.value,
                      })
                    }
                    disabled={!manualAddress.province || loadingWards}
                  >
                    <option value="">
                      {!manualAddress.province
                        ? "Chọn tỉnh/thành trước"
                        : loadingWards
                          ? "Đang tải phường/xã..."
                          : "Chọn Phường/Xã"}
                    </option>
                    {wards.map((wardOption) => (
                      <option key={wardOption.label} value={wardOption.value}>
                        {wardOption.label}
                      </option>
                    ))}
                  </select>
                </>
              )}
              <input
                placeholder="Chi tiết địa chỉ"
                value={manualAddress.detail_address}
                onChange={(e) =>
                  setManualAddress({
                    ...manualAddress,
                    detail_address: e.target.value,
                  })
                }
              />
            </div>
          )}
        </div>

        <div className="checkout-section">
          <p className="section-label">
            <FiTruck /> Vận chuyển
          </p>
          <select
            value={shippingMethod}
            onChange={(e) => setShippingMethod(e.target.value)}
          >
            <option value="Standard">Tiêu chuẩn</option>
            <option value="Express">Nhanh</option>
            <option value="SameDay">Trong ngày</option>
          </select>
        </div>

        <div className="checkout-section">
          <p className="section-label">
            <FiCreditCard /> Thanh toán
          </p>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="COD">COD</option>
            <option value="VNPAY">VNPay</option>
            <option value="MOMO">Momo</option>
          </select>
          <input
            placeholder="Mã khuyến mãi"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
        </div>

        <div className="checkout-confirmation card-soft">
          <div>
            <span>Tạm tính</span>
            <strong>{subtotal.toLocaleString("vi-VN")} VND</strong>
          </div>
          <div>
            <span>Phí vận chuyển</span>
            <strong>{shippingFee.toLocaleString("vi-VN")} VND</strong>
          </div>
          <div>
            <span>Tổng tạm tính</span>
            <strong>{total.toLocaleString("vi-VN")} VND</strong>
          </div>
        </div>

        <button
          className="btn"
          onClick={placeOrder}
          disabled={loading || !items.length}
        >
          <FiCheckCircle /> {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
        </button>
      </section>

      <aside className="card checkout-summary">
        <p className="section-label">Đơn hàng</p>
        <h4>{items.length} sản phẩm</h4>
        {items.map((item) => (
          <div key={item.variant_id} className="summary-item">
            <div>
              <strong>{item.name}</strong>
              <p className="meta-line">
                {item.size} x {item.quantity}
              </p>
            </div>
            <span>
              {(Number(item.price) * item.quantity).toLocaleString("vi-VN")} VND
            </span>
          </div>
        ))}
      </aside>
    </div>
  );
}
