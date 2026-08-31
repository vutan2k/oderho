import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ShieldAlert, ArrowLeft, ShieldCheck, CheckCircle2, Loader2, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const { loginUser, loginWithGoogleAuth } = useContext(AppContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showInternalLogin, setShowInternalLogin] = useState(false);

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
        borderRadius: '24px',
        border: '1px solid var(--border-color, #E5E7EB)',
        boxShadow: 'var(--shadow-md, 0 8px 30px rgba(0,0,0,0.06))',
        padding: '38px 28px',
      }}>
        {/* Title Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img
            src="/tavy-logo.png"
            alt="TAVY Logo"
            style={{ height: '58px', width: 'auto', display: 'inline-block', objectFit: 'contain', marginBottom: '4px' }}
          />
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--purple-primary, #7A4B9E)', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
            KOREA
          </div>
          <h2 style={{ fontSize: '1.65rem', fontFamily: 'var(--font-serif)', color: 'var(--text-dark, #1F2937)', fontWeight: 600, marginTop: '6px' }}>
            Đăng Nhập Với Google Gmail
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #6B7280)', marginTop: '4px' }}>
            TAVY KOREA • MUA HÀNG HÀN QUỐC CHÍNH HÃNG
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#991B1B',
            borderRadius: '12px',
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

        {/* Khối Giới Thiệu Bảo Mật Chuẩn Google Gmail */}
        <div style={{
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '14px',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '22px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1E293B', fontWeight: 700, fontSize: '0.92rem' }}>
            <ShieldCheck size={20} style={{ color: 'var(--purple-primary, #7A4B9E)' }} />
            <span>Bảo mật danh tính 100% qua Google Gmail</span>
          </div>
          
          <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
            TAVY hỗ trợ đăng nhập 1 chạm an toàn bằng tài khoản Google Gmail. Hệ thống tự động kích hoạt tài khoản và lưu trữ lịch sử đơn hàng vào cơ sở dữ liệu.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '2px', fontSize: '0.8rem', color: '#334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: '#10B981', flexShrink: 0 }} />
              <span>Xác thực Gmail chính chủ 100%, chống tài khoản ảo</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: '#10B981', flexShrink: 0 }} />
              <span>Không cần tạo hay ghi nhớ mật khẩu, bảo mật 2 lớp an toàn</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: '#10B981', flexShrink: 0 }} />
              <span>Tự động lưu phiên đăng nhập & đồng bộ lịch sử mua hàng</span>
            </div>
          </div>
        </div>

        {/* Nút Đăng Nhập Chính Bằng Google Gmail */}
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
            fontSize: '0.94rem',
            fontWeight: 700,
            cursor: isGoogleLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
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
              <span>Tiếp tục với Google Gmail</span>
            </>
          )}
        </button>

        <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#9CA3AF', marginTop: '16px' }}>
          Bằng việc tiếp tục, Quý khách đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của TAVY KOREA.
        </div>

        {/* Mục đăng nhập nội bộ phụ thu gọn (dành cho Admin / Tester) */}
        <div style={{ marginTop: '22px', borderTop: '1px dashed #E5E7EB', paddingTop: '16px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => setShowInternalLogin(!showInternalLogin)}
            style={{
              background: 'none',
              border: 'none',
              color: '#9CA3AF',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontWeight: 600
            }}
          >
            <KeyRound size={13} />
            <span>{showInternalLogin ? 'Ẩn đăng nhập nội bộ' : 'Đăng nhập nội bộ (Dành cho Quản trị / Tester)'}</span>
          </button>

          {showInternalLogin && (
            <form onSubmit={handleManualLogin} style={{ marginTop: '14px', textAlign: 'left' }}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#6B7280', marginBottom: '4px' }}>
                  Tài khoản / Email nội bộ
                </label>
                <input
                  type="text"
                  placeholder="tan123..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#FFFFFF',
                    color: '#1F2937',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#6B7280', marginBottom: '4px' }}>
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
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#FFFFFF',
                    color: '#1F2937',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '10px 0',
                  fontSize: '0.8rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  backgroundColor: '#334155',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                ĐĂNG NHẬP TÀI KHOẢN NỘI BỘ
              </button>
            </form>
          )}
        </div>

        {/* Nút Quay Về Trang Chủ */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
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

