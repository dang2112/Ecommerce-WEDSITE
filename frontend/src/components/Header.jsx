import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  FiGrid,
  FiShoppingCart,
  FiPackage,
  FiSettings,
  FiBarChart2,
  FiBox,
  FiLogOut,
  FiLogIn,
  FiUserPlus,
  FiUser,
} from "react-icons/fi";

export default function Header() {
  const { user, logout } = useAuth();
  const { items, clearCart } = useCart();
  const cartCount = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  const handleLogout = () => {
    clearCart();
    logout();
  };

  return (
    <header className="header">
      <div className="brand-wrap">
        <p className="brand-kicker">Thời trang thương mại</p>
        <h1 className="brand-name">Ecommerce Pro</h1>
      </div>

      <nav className="nav-links">
        <Link to="/">
          <FiGrid /> Sản phẩm
        </Link>
        {user?.role === "Admin" ? (
          <>
            <Link to="/admin/dashboard">
              <FiBarChart2 /> Bảng điều khiển doanh thu
            </Link>
            <Link to="/admin/products">
              <FiBox /> Quản lý sản phẩm
            </Link>
            <Link to="/admin/orders">
              <FiSettings /> Quản lý đơn hàng
            </Link>
          </>
        ) : (
          <>
            <Link to="/cart" className="cart-link">
              <span className="cart-icon-wrap">
                <FiShoppingCart />
                {cartCount > 0 && (
                  <span className="cart-badge">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </span>
              Giỏ hàng
            </Link>
            {user && (
              <Link to="/my-orders">
                <FiPackage /> Đơn của tôi
              </Link>
            )}
          </>
        )}
      </nav>

      <div className="user-zone">
        {user ? (
          <>
            <span className="user-chip">
              <FiUser /> {user.full_name}
            </span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              <FiLogOut /> Đăng xuất
            </button>
          </>
        ) : (
          <>
            <Link className="btn btn-ghost" to="/login">
              <FiLogIn /> Đăng nhập
            </Link>
            <Link className="btn" to="/register">
              <FiUserPlus /> Đăng ký
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
