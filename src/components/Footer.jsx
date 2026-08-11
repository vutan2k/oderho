import React from 'react';
import { Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <a href="#" className="brand-logo" style={{ marginBottom: '16px' }}>
              <span className="brand-logo-text">K-MART<span>VIỆT HÀN</span></span>
            </a>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
              Hệ thống chuyên phân phối Mỹ phẩm Olive Young & Thực phẩm chức năng, thuốc nội địa Hàn Quốc chính hãng cho người Việt.
            </p>
          </div>

          <div className="footer-col">
            <h5>DANH MỤC HÀNG</h5>
            <ul className="footer-links">
              <li><a href="#skincare">Mỹ phẩm Dưỡng da</a></li>
              <li><a href="#makeup">Mỹ phẩm Trang điểm</a></li>
              <li><a href="#health">Hồng sâm & Collagen</a></li>
              <li><a href="#pharmacy">Thuốc hiệu thuốc Hàn</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>LIÊN HỆ</h5>
            <ul className="footer-links" style={{ gap: '12px' }}>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Phone size={14} color="var(--purple-primary)" />
                <span>Hotline VN: 0988 888 888</span>
              </li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Phone size={14} color="var(--purple-primary)" />
                <span>Hotline Korea: +82 10-1234-5678</span>
              </li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Mail size={14} color="var(--purple-primary)" />
                <span>support@kmartviethan.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '24px',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-light)'
        }}>
          © 2026 K-MART VIỆT HÀN. Tất cả quyền được bảo lưu. Dịch vụ hàng xách tay & nhập khẩu Hàn Quốc uy tín.
        </div>
      </div>
    </footer>
  );
}
