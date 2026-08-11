import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ShieldCheck, Lock, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const { loginAdmin, isAdminAuthenticated } = useContext(AppContext);
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAdminAuthenticated) {
    navigate('/admin/dashboard');
  }

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    const res = loginAdmin(password);
    if (res.success) {
      navigate('/admin/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1A1C23 0%, #111319 100%)',
      color: '#FFF',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: '#242731',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '36px 30px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(122, 75, 158, 0.2)',
            color: 'var(--purple-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            border: '1px solid var(--purple-primary)'
          }}>
            <ShieldCheck size={30} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFF' }}>Cổng Quản Trị Admin</h2>
          <p style={{ fontSize: '0.85rem', color: '#9CA3AF', marginTop: '6px' }}>
            Hệ thống quản lý đơn hàng K-MART VIỆT HÀN
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #EF4444',
            color: '#F87171',
            padding: '12px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#D1D5DB', marginBottom: '8px' }}>
              Mật khẩu cấp cao Admin
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
                  padding: '12px 14px 12px 40px',
                  borderRadius: '8px',
                  border: '1px solid #374151',
                  backgroundColor: '#1F2937',
                  color: '#FFF',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn-gold"
            style={{ width: '100%', padding: '12px 0', justifyContent: 'center', fontSize: '0.9rem' }}
          >
            ĐĂNG NHẬP ADMIN
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#9CA3AF',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={14} /> Quay về Trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
