import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { User, LogOut, Package, LogIn } from 'lucide-react';

export default function Navbar({ logoSrc }) {
  const { currentUser, logoutUser } = useContext(AppContext);
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

        {/* User Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {currentUser ? (
            <>
              <Link
                to="/orders"
                className="btn-ghost"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
              >
                <Package size={16} />
                <span>Đơn hàng của tôi</span>
              </Link>
              <Link
                to="/profile"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none', padding: '0 4px' }}
              >
                <User size={15} color="var(--purple-primary)" />
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{currentUser.name || currentUser.email}</span>
              </Link>
              <button
                onClick={() => {
                  logoutUser();
                  navigate('/');
                }}
                className="btn-ghost"
                title="Đăng xuất"
                style={{ padding: '8px' }}
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="btn-primary"
              style={{ fontSize: '0.82rem', padding: '8px 16px' }}
            >
              <LogIn size={15} />
              <span>Đăng nhập / Đăng ký</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
