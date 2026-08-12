import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { User, LogOut, Package, LogIn, ShoppingCart } from 'lucide-react';

export default function Navbar({ logoSrc }) {
  const { currentUser, logoutUser, cart } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}>
        {/* Logo Link */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <img
            src="/tavy-logo.png"
            alt="TAVY Logo"
            style={{ height: '48px', width: 'auto', display: 'block', objectFit: 'contain' }}
          />
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--purple-primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
            KOREA
          </span>
        </Link>

        {/* User Navigation: 4 biểu tượng chính */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* 1. Giỏ hàng */}
          <Link id="cart-icon-header" to="/cart" className="icon-btn" style={{ position: 'relative', transition: 'transform 0.2s ease', color: 'var(--text-dark)' }} aria-label="Giỏ hàng" title="Giỏ hàng">
            <ShoppingCart size={24} />
            {cart && cart.length > 0 && (
              <span style={{
                position: 'absolute', top: '-8px', right: '-12px',
                backgroundColor: '#3B82F6', color: '#FFF', fontSize: '0.75rem',
                fontWeight: 800, width: '22px', height: '22px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%'
              }}>
                {cart.length > 99 ? '99+' : cart.length}
              </span>
            )}
          </Link>

          {/* 2. Đơn hàng của tôi */}
          <Link to="/orders" className="icon-btn" aria-label="Đơn hàng của tôi" title="Đơn hàng của tôi" style={{ color: 'var(--text-dark)', textDecoration: 'none' }}>
            <Package size={24} />
          </Link>

          {/* 3. Hồ sơ cá nhân */}
          <Link to="/profile" className="icon-btn" aria-label="Hồ sơ cá nhân" title="Hồ sơ cá nhân" style={{ color: 'var(--text-dark)', textDecoration: 'none' }}>
            <User size={24} />
          </Link>

          {/* 4. Đăng nhập / Đăng xuất */}
          {currentUser ? (
            <button
              onClick={() => {
                logoutUser();
                navigate('/');
              }}
              className="icon-btn"
              aria-label="Đăng xuất"
              title="Đăng xuất"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dark)', padding: 0 }}
            >
              <LogOut size={24} />
            </button>
          ) : (
            <Link to="/login" className="icon-btn" aria-label="Đăng nhập" title="Đăng nhập" style={{ color: 'var(--text-dark)', textDecoration: 'none' }}>
              <LogIn size={24} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
