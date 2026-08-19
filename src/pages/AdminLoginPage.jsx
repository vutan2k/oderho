import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Lock, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const { loginAdmin, isAdminAuthenticated } = useContext(AppContext);
  const navigate = useNavigate();
  const [password, setPassword] = useState('tan123');
  const [error, setError] = useState('');

  if (isAdminAuthenticated) {
    navigate('/admin/dashboard');
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const res = await loginAdmin(password);
    if (res.success) {
      navigate('/admin/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-ivory)',
      padding: '40px 20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid var(--border-color)',
        padding: '40px 32px',
        boxShadow: 'var(--shadow-md)'
      }}>
        {/* Title Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/tavy-logo.png" alt="TAVY Logo" style={{ height: '64px', width: 'auto', display: 'inline-block', objectFit: 'contain', marginBottom: '8px' }} />
          <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', color: 'var(--text-dark)', fontWeight: 400 }}>
            Quản Trị Hệ Thống
          </h2>
          <div style={{ marginTop: '8px', padding: '6px 12px', background: '#F3E8FF', borderRadius: '8px', border: '1px solid #DDD6FE', fontSize: '0.82rem', color: '#6B21A8', fontWeight: 700 }}>
            🔑 Mật khẩu Admin Test: <code style={{ color: '#7C3AED' }}>tan123</code>
          </div>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#991B1B',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-dark)', marginBottom: '8px' }}>
              Mật khẩu Admin cấp cao
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                placeholder="Nhập mật khẩu quản trị..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 44px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#FFF',
                  color: 'var(--text-dark)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border 0.2s ease'
                }}
              />
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--purple-primary)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn-gold"
            style={{ width: '100%', padding: '14px 0', justifyContent: 'center', fontSize: '0.85rem', borderRadius: '10px' }}
          >
            ĐĂNG NHẬP VÀO HỆ THỐNG
          </button>
        </form>

        <div style={{ marginTop: '28px', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={16} /> Quay về Trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
