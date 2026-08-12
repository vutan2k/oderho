import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { User, Lock, Save, Mail, LogIn, ArrowLeft } from 'lucide-react';
import CascadingAddressSelector from '../components/CascadingAddressSelector';

export default function UserProfilePage() {
  const { currentUser, updateUserProfile } = useContext(AppContext);
  const navigate = useNavigate();
  const showToast = useToast();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      if (showToast) showToast('Mật khẩu xác nhận không trùng khớp!', 'error');
      return;
    }

    const res = updateUserProfile({
      name,
      phone,
      address,
      ...(newPassword ? { password: newPassword } : {})
    });

    if (res.success) {
      if (showToast) showToast('Cập nhật hồ sơ cá nhân thành công!', 'success');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      if (showToast) showToast(res.message || 'Lỗi cập nhật hồ sơ', 'error');
    }
  };

  if (!currentUser) {
    return (
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FDFBF7',
        padding: '40px 20px',
      }}>
        <div style={{
          maxWidth: '460px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          border: '1px solid #E5E7EB',
        }}>
          <div style={{
            width: '68px',
            height: '68px',
            backgroundColor: '#F3E8FF',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--purple-primary)',
            marginBottom: '20px'
          }}>
            <User size={36} />
          </div>
          <h2 style={{
            fontSize: '1.5rem',
            fontFamily: 'var(--font-serif)',
            color: 'var(--text-dark)',
            marginBottom: '10px'
          }}>
            Yêu cầu Đăng nhập
          </h2>
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            lineHeight: '1.6',
            marginBottom: '28px'
          }}>
            Vui lòng đăng nhập tài khoản để xem và cập nhật hồ sơ cá nhân, địa chỉ giao hàng của bạn.
          </p>

          <button
            onClick={() => navigate('/login')}
            className="btn-gold"
            style={{
              width: '100%',
              padding: '14px 0',
              justifyContent: 'center',
              fontSize: '0.9rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}
          >
            <LogIn size={18} /> ĐĂNG NHẬP NGAY
          </button>

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
    );
  }

  return (
    <div style={{ backgroundColor: '#FDFBF7', minHeight: '90vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header Profile */}
        <div style={{
          backgroundColor: '#FFF',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: '1px solid #E5E7EB',
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--purple-primary)',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 800
          }}>
            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', color: '#111827' }}>
              {currentUser.name || 'Khách Hàng TAVY'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280', fontSize: '0.9rem' }}>
              <Mail size={16} />
              <span>{currentUser.email}</span>
              <span style={{ background: '#D1FAE5', color: '#065F46', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                Tài Khoản Xác Thực
              </span>
            </div>
          </div>
        </div>

        {/* Form Cập Nhật Hồ Sơ */}
        <div style={{
          backgroundColor: '#FFF',
          borderRadius: '20px',
          padding: '36px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: '1px solid #E5E7EB'
        }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', color: 'var(--purple-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={20} />
            HỒ SƠ VÀ SỔ ĐỊA CHỈ GIAO HÀNG
          </h3>

          <form onSubmit={handleSaveProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">Họ và tên *</label>
                <input
                  type="text"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Số điện thoại chính *</label>
                <input
                  type="tel"
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912 345 678"
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <CascadingAddressSelector
                initialAddress={currentUser?.address || address}
                onChange={(addrInfo) => setAddress(addrInfo.fullAddress)}
                required={true}
              />
            </div>

            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '24px', marginTop: '24px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={18} />
                ĐỔI MẬT KHẨU (TÙY CHỌN)
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
                <div className="form-group">
                  <label className="form-label">Mật khẩu mới</label>
                  <input
                    type="password"
                    className="input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    className="input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '14px 32px' }}>
              <Save size={18} />
              <span>LƯU THAY ĐỔI HỒ SƠ</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
