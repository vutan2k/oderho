import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { LogIn, UserPlus, ShieldAlert, ArrowLeft, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { loginUser, loginWithGoogleAuth } = useContext(AppContext);
  const navigate = useNavigate();

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      const res = await loginWithGoogleAuth();
      if (res.success) {
        navigate('/');
      } else if (res.message) {
        setError(res.message);
      }
    } catch (err) {
      setError('Lỗi kết nối dịch vụ Google. Vui lòng thử lại.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await loginUser(email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message || 'Mật khẩu hoặc email/ID không chính xác.');
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
      backgroundColor: 'var(--bg-ivory, #FAF8F5)',
      padding: '40px 20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: 'var(--bg-white, #FFFFFF)',
        borderRadius: '20px',
        border: '1px solid var(--border-color, #E5E7EB)',
        boxShadow: 'var(--shadow-md, 0 4px 20px rgba(0,0,0,0.06))',
        padding: '36px 28px',
      }}>
        {/* Title Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img src="/tavy-logo.png" alt="TAVY Logo" style={{ height: '56px', width: 'auto', display: 'inline-block', objectFit: 'contain', marginBottom: '4px' }} />
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--purple-primary, #7A4B9E)', letterSpacing: '2px', textTransform: 'uppercase' }}>
            KOREA
          </div>
          <h2 style={{ fontSize: '1.65rem', fontFamily: 'var(--font-serif)', color: 'var(--text-dark, #1F2937)', fontWeight: 600, marginTop: '4px' }}>
            {isLoginTab ? 'Đăng Nhập Tài Khoản' : 'Tạo Tài Khoản Mới'}
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #6B7280)', marginTop: '4px' }}>
            TAVY KOREA • MUA HÀNG HÀN QUỐC CHÍNH HÃNG
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color, #E5E7EB)',
          marginBottom: '22px',
        }}>
          <button
            type="button"
            onClick={() => { setIsLoginTab(true); setError(''); }}
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              borderBottom: isLoginTab ? '2px solid var(--purple-primary, #7A4B9E)' : '2px solid transparent',
              color: isLoginTab ? 'var(--purple-primary, #7A4B9E)' : 'var(--text-muted, #6B7280)',
              fontWeight: isLoginTab ? 800 : 500,
              fontSize: '0.85rem',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <LogIn size={16} /> Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => { setIsLoginTab(false); setError(''); }}
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              borderBottom: !isLoginTab ? '2px solid var(--purple-primary, #7A4B9E)' : '2px solid transparent',
              color: !isLoginTab ? 'var(--purple-primary, #7A4B9E)' : 'var(--text-muted, #6B7280)',
              fontWeight: !isLoginTab ? 800 : 500,
              fontSize: '0.85rem',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <UserPlus size={16} /> Đăng ký (Gmail)
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
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: ĐĂNG NHẬP */}
        {isLoginTab ? (
          <div>
            {/* Nút Đăng nhập nhanh Google - Ưu tiên hàng đầu */}
            <button
              type="button"
              disabled={isGoogleLoading}
              onClick={handleGoogleAuth}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '12px',
                border: '1.5px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: '#1F2937',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: isGoogleLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease',
                opacity: isGoogleLoading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isGoogleLoading) e.currentTarget.style.backgroundColor = '#F8FAFC';
              }}
              onMouseLeave={(e) => {
                if (!isGoogleLoading) e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Đang kết nối Google...</span>
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z"/>
                    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.41-1.57-5.13-3.72L.97 13.04C2.45 15.98 5.48 18 9 18z"/>
                    <path fill="#FBBC05" d="M3.87 10.8c-.19-.53-.3-1.1-.3-1.8s.11-1.27.3-1.8L.97 4.96C.35 6.18 0 7.55 0 9s.35 2.82.97 4.04l2.9-2.24z"/>
                    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.45 2.02.97 4.96l2.9 2.24C4.59 5.05 6.62 3.58 9 3.58z"/>
                  </svg>
                  <span>Đăng nhập nhanh bằng Google Gmail</span>
                </>
              )}
            </button>

            {/* Phân cách */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              margin: '20px 0 16px 0'
            }}>
              <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }}></div>
              <span style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase' }}>
                Hoặc tài khoản nội bộ
              </span>
              <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }}></div>
            </div>

            {/* Form đăng nhập nội bộ (dành cho admin / test ID tan123) */}
            <form onSubmit={handleManualLogin}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#374151', marginBottom: '6px' }}>
                  Tài khoản / Email
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên tài khoản hoặc Email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#FFFFFF',
                    color: '#1F2937',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#374151', marginBottom: '6px' }}>
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
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#FFFFFF',
                    color: '#1F2937',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn-gold"
                style={{
                  width: '100%',
                  padding: '12px 0',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  backgroundColor: '#1E293B',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                ĐĂNG NHẬP NỘI BỘ
              </button>
            </form>
          </div>
        ) : (
          /* TAB 2: ĐĂNG KÝ MỚI BẢO MẬT BẰNG GOOGLE GMAIL */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Thẻ Giới Thiệu Bảo Mật Chuẩn Gmail */}
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '14px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1E293B', fontWeight: 700, fontSize: '0.92rem' }}>
                <ShieldCheck size={20} style={{ color: 'var(--purple-primary, #7A4B9E)' }} />
                <span>Xác thực danh tính bảo mật qua Google Gmail</span>
              </div>
              
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                TAVY áp dụng phương thức tạo tài khoản chính chủ qua Google Gmail nhằm chống tài khoản ảo và bảo vệ tuyệt đối lịch sử đơn hàng của Quý khách.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '2px', fontSize: '0.8rem', color: '#334155' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} style={{ color: '#10B981', flexShrink: 0 }} />
                  <span>Xác thực Gmail chính chủ 100%, chống giả mạo danh tính</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} style={{ color: '#10B981', flexShrink: 0 }} />
                  <span>Không cần ghi nhớ mật khẩu, bảo mật 2 lớp an toàn</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} style={{ color: '#10B981', flexShrink: 0 }} />
                  <span>Tự động kích hoạt tài khoản & đồng bộ thông tin nhận hàng</span>
                </div>
              </div>
            </div>

            {/* Nút Tạo Tài Khoản Lớn Bằng Google Gmail */}
            <button
              type="button"
              disabled={isGoogleLoading}
              onClick={handleGoogleAuth}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: '2px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: '#1E293B',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: isGoogleLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease',
                opacity: isGoogleLoading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isGoogleLoading) {
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }
              }}
              onMouseLeave={(e) => {
                if (!isGoogleLoading) {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }
              }}
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Đang kết nối Google Gmail...</span>
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z"/>
                    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.41-1.57-5.13-3.72L.97 13.04C2.45 15.98 5.48 18 9 18z"/>
                    <path fill="#FBBC05" d="M3.87 10.8c-.19-.53-.3-1.1-.3-1.8s.11-1.27.3-1.8L.97 4.96C.35 6.18 0 7.55 0 9s.35 2.82.97 4.04l2.9-2.24z"/>
                    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.45 2.02.97 4.96l2.9 2.24C4.59 5.05 6.62 3.58 9 3.58z"/>
                  </svg>
                  <span>Tạo tài khoản bằng Google Gmail</span>
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#9CA3AF' }}>
              Bằng việc đăng ký, Quý khách đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của TAVY KOREA.
            </div>
          </div>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted, #6B7280)',
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

