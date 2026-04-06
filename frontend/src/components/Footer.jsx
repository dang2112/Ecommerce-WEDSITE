import { Link } from "react-router-dom";
import {
  FiFacebook,
  FiInstagram,
  FiMail,
  FiMapPin,
  FiPhone,
} from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="site-footer container">
      <div className="footer-grid card">
        <section>
          <p className="section-label">Ecommerce Pro</p>
          <h4>Thời trang hiện đại, giao nhanh, thanh toán linh hoạt.</h4>
          <p>
            Hệ thống thương mại điện tử cho trải nghiệm mua sắm tiết kiệm và an
            toàn.
          </p>
        </section>

        <section>
          <p className="section-label">Điều hướng</p>
          <div className="footer-links">
            <Link to="/">Sản phẩm</Link>
            <Link to="/cart">Giỏ hàng</Link>
            <Link to="/my-orders">Đơn của tôi</Link>
            <Link to="/admin/dashboard">Quản trị</Link>
          </div>
        </section>

        <section>
          <p className="section-label">Liên hệ</p>
          <div className="footer-contact">
            <p>
              <FiPhone /> 0123456789
            </p>
            <p>
              <FiMail /> support@gmail.com
            </p>
            <p>
              <FiMapPin /> Thủ đức, Thành phố Hồ Chí Minh
            </p>
          </div>
          <div className="footer-social">
            <a href="#" aria-label="Facebook">
              <FiFacebook />
            </a>
            <a href="#" aria-label="Instagram">
              <FiInstagram />
            </a>
          </div>
        </section>
      </div>
      <p className="footer-copy">© 2026 Ecommerce Pro. Bảo lưu mọi quyền.</p>
    </footer>
  );
}
