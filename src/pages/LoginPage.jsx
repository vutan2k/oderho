import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { LogIn, UserPlus, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const { loginUser, registerUser, loginWithGoogleAuth } = useContext(AppContext);
  const navigate = useNavigate();

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLoginTab) {
        const res = await loginUser(email, password);
        if (res.success) {
          navigate('/');
        } else {
          setError(res.message || 'Mật khẩu hoặc email/ID không chính xác.');
        }
      } else {
        if (!name.trim()) {
          setError('Vui lòng nhập họ và tên.');
          return;
        }
        const res = await registerUser(email, password, name);
        if (res.success) {
          navigate('/');
        } else {
          setError(res.message);
        }
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra. Vui lòng kiểm tra lại thông tin.');
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-ivory)',
      padding: '40px 20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)',
        padding: '40px 32px',
      }}>
        {/* Title Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img src="/tavy-logo.png" alt="TAVY Logo" style={{ height: '60px', width: 'auto', display: 'inline-block', objectFit: 'contain', marginBottom: '4px' }} />
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--purple-primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
            KOREA
          </div>
          <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', color: 'var(--text-dark)', fontWeight: 400, marginTop: '4px' }}>
            {isLoginTab ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Tài Khoản'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            TAVY KOREA • MUA HÀNG HÀN QUỐC CHÍNH HÃNG
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '24px',
        }}>
          <button
            type="button"
            onClick={() => { setIsLoginTab(true); setError(''); }}
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              borderBottom: isLoginTab ? '2px solid var(--purple-primary)' : '2px solid transparent',
              color: isLoginTab ? 'var(--purple-primary)' : 'var(--text-muted)',
              fontWeight: isLoginTab ? 700 : 500,
              fontSize: '0.85rem',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <LogIn size={15} /> Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => { setIsLoginTab(false); setError(''); }}
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              borderBottom: !isLoginTab ? '2px solid var(--purple-primary)' : '2px solid transparent',
              color: !isLoginTab ? 'var(--purple-primary)' : 'var(--text-muted)',
              fontWeight: !isLoginTab ? 700 : 500,
              fontSize: '0.85rem',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <UserPlus size={15} /> Đăng ký
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#991B1B',
            borderRadius: '10px',
            padding: '12px 14px',
            fontSize: '0.85rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLoginTab && (
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-dark)', marginBottom: '6px' }}>
                Họ và tên
              </label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-dark)', marginBottom: '6px' }}>
              Địa chỉ Email
            </label>
            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-dark)', marginBottom: '6px' }}>
              Mật khẩu
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            className="btn-gold"
            style={{ width: '100%', padding: '13px 0', justifyContent: 'center', fontSize: '0.85rem', borderRadius: '10px' }}
          >
            {isLoginTab ? 'ĐĂNG NHẬP NGAY' : 'TẠO TÀI KHOẢN MỚI'}
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: '22px 0 18px 0'
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>HOẶC</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          </div>

          <button
            type="button"
            onClick={async () => {
              setError('');
              const res = await loginWithGoogleAuth();
              if (res.success) {
                navigate('/');
              } else if (res.message) {
                setError(res.message);
              }
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              backgroundColor: '#FFF',
              color: 'var(--text-dark)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s ease'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.41-1.57-5.13-3.72L.97 13.04C2.45 15.98 5.48 18 9 18z"/>
              <path fill="#FBBC05" d="M3.87 10.8c-.19-.53-.3-1.1-.3-1.8s.11-1.27.3-1.8L.97 4.96C.35 6.18 0 7.55 0 9s.35 2.82.97 4.04l2.9-2.24z"/>
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.45 2.02.97 4.96l2.9 2.24C4.59 5.05 6.62 3.58 9 3.58z"/>
            </svg>
            <span>Đăng nhập nhanh bằng Google</span>
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
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
