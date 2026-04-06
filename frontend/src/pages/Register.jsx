import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function Register() {
  const [form, setForm] = useState({
    phone_number: "",
    password: "",
    full_name: "",
  });
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!toastMessage) return;
    const timeoutId = setTimeout(() => setToastMessage(""), 2000);
    return () => clearTimeout(timeoutId);
  }, [toastMessage]);

  const showToast = (message, type = "error") => {
    setToastType(type);
    setToastMessage(message);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setToastMessage("");
      if (
        !form.full_name.trim() ||
        !form.phone_number.trim() ||
        !form.password.trim()
      ) {
        showToast(
          "Vui lòng nhập đầy đủ họ tên, số điện thoại và mật khẩu",
          "error",
        );
        return;
      }

      const res = await client.post("/auth/register", form);
      login(res.data.token, res.data.user);
      nav("/");
    } catch (err) {
      showToast(err.response?.data?.message || "Đăng ký thất bại", "error");
    }
  };

  return (
    <form className="card form" onSubmit={submit}>
      {toastMessage && (
        <div
          className={
            toastType === "error" ? "toast-notice toast-error" : "toast-notice"
          }
          role="status"
          aria-live="polite"
        >
          {toastMessage}
        </div>
      )}
      <p className="section-label">Tạo tài khoản</p>
      <h3>Đăng ký</h3>
      <label>Họ và tên</label>
      <input
        placeholder="Nhập họ tên"
        value={form.full_name}
        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
      />
      <label>Số điện thoại</label>
      <input
        placeholder="Nhập số điện thoại"
        value={form.phone_number}
        onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
      />
      <label>Mật khẩu</label>
      <div className="password-field">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Nhập mật khẩu"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShowPassword((value) => !value)}
          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {showPassword ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
      <button className="btn">Đăng ký</button>
    </form>
  );
}
