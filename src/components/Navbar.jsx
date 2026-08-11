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
          {logoSrc ? (
            <img
              src={logoSrc}
              alt="BeautyCargo"
              style={{ height: '44px', width: 'auto', display: 'block' }}
            />
          ) : (
            <svg
              width="44"
              height="44"
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="BeautyCargo"
            >
              <rect x="10" y="20" width="24" height="16" rx="2" stroke="#1a1a1a" strokeWidth="1.8" fill="none"/>
              <line x1="22" y1="20" x2="22" y2="36" stroke="#B76E79" strokeWidth="1.8"/>
              <line x1="10" y1="27" x2="34" y2="27" stroke="#B76E79" strokeWidth="1.8"/>
              <path d="M17 20 Q14 14 18 12 Q22 10 22 16" stroke="#1a1a1a" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
              <path d="M27 20 Q30 14 26 12 Q22 10 22 16" stroke="#1a1a1a" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
              <path d="M8 10 Q22 4 36 10" stroke="#B76E79" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeDasharray="2 2"/>
              <polyline points="33,7 36,10 33,13" stroke="#B76E79" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Beauty<span style={{ color: 'var(--accent)' }}>Cargo</span>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0 4px' }}>
                <User size={15} />
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{currentUser.name || currentUser.email}</span>
              </div>
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
