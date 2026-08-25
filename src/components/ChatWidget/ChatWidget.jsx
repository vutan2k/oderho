import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Send, ShieldCheck, Clock, ExternalLink, Phone } from 'lucide-react';

// Biểu tượng Zalo chính hãng
const ZaloIcon = ({ size = 26, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <rect width="48" height="48" rx="24" fill="#0068FF" />
    <path
      d="M13.5 20.6H17.8L13 27.4H19.2V29.4H11.2V27.4L16 20.6H11.2V18.6H19.2V20.6H13.5ZM24.4 29.4C22.6 29.4 21.2 28.6 20.4 27.2L22 25.8C22.6 26.8 23.4 27.4 24.4 27.4C25.6 27.4 26.4 26.6 26.4 25.4C26.4 24.2 25.6 23.4 24.2 23.4H23V21.4H24C25.2 21.4 25.8 20.8 25.8 19.8C25.8 18.8 25.2 18.2 24.2 18.2C23.2 18.2 22.4 18.8 22 19.6L20.4 18.2C21.2 17 22.6 16.2 24.2 16.2C26.4 16.2 28 17.6 28 19.6C28 20.8 27.4 21.8 26.4 22.2C27.6 22.6 28.6 23.8 28.6 25.4C28.6 27.8 26.8 29.4 24.4 29.4ZM32 29.4C30.8 29.4 30 28.6 30 27.4V14.6H32.2V27.2C32.2 27.4 32.4 27.6 32.6 27.6C32.8 27.6 33 27.4 33 27.2V14.6H35.2V27.4C35.2 28.6 34.4 29.4 33.2 29.4H32ZM40 29.4C37.4 29.4 35.4 27.4 35.4 24C35.4 20.6 37.4 18.6 40 18.6C42.6 18.6 44.6 20.6 44.6 24C44.6 27.4 42.6 29.4 40 29.4ZM40 27.4C41.4 27.4 42.4 26 42.4 24C42.4 22 41.4 20.6 40 20.6C38.6 20.6 37.6 22 37.6 24C37.6 26 38.6 27.4 40 27.4Z"
      fill="#FFFFFF"
    />
  </svg>
);

export default function ChatWidget() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Cấu hình Zalo & Facebook Messenger của TAVY Korea
  const rawZaloPhone = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ZALO_PHONE) || '0988888888';
  const cleanZaloPhone = rawZaloPhone.replace(/[^0-9]/g, '');
  const zaloChatUrl = `https://zalo.me/${cleanZaloPhone}`;
  const displayZaloPhone = '0988 888 888';

  // Link Facebook Messenger & Profile của TAVY Korea
  const facebookPageId = '100062954372060';
  const facebookMessengerUrl = `https://m.me/${facebookPageId}`;
  const facebookProfileUrl = `https://www.facebook.com/profile.php?id=${facebookPageId}`;

  // Không hiển thị ChatWidget trong toàn bộ các trang Admin
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Lock body scroll on mobile when chat is opened
  useEffect(() => {
    if (isMobile && isOpen && !isAdminRoute) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isOpen, isAdminRoute]);

  if (isAdminRoute) {
    return null;
  }

  const btnSize = isMobile ? '52px' : '58px';

  return (
    <div
      style={
        isMobile && isOpen
          ? {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99999,
              fontFamily: 'var(--font-sans, system-ui, sans-serif)'
            }
          : {
              position: 'fixed',
              bottom: isMobile ? '16px' : '22px',
              right: isMobile ? '14px' : '22px',
              zIndex: 9995,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              fontFamily: 'var(--font-sans, system-ui, sans-serif)'
            }
      }
    >
      {/* 1. CỤM NÚT TRÒN TƯ VẤN (ZALO Ở TRÊN + MESSENGER Ở DƯỚI) */}
      {!isOpen && (
        <>
          {/* A. NÚT ZALO NẰM PHÍA TRÊN NÚT MESSENGER */}
          <a
            href={zaloChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Nhắn tin tư vấn qua Zalo"
            title={`Nhắn tin tư vấn trực tiếp qua Zalo (${displayZaloPhone})`}
            style={{
              width: btnSize,
              height: btnSize,
              borderRadius: '50%',
              backgroundColor: '#0068FF',
              color: '#FFFFFF',
              border: '2px solid #FFFFFF',
              boxShadow: '0 6px 20px rgba(0, 104, 255, 0.45)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease',
              touchAction: 'manipulation',
              textDecoration: 'none',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.08)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 104, 255, 0.6)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 104, 255, 0.45)';
              }
            }}
          >
            {/* Hiệu ứng badge chữ Zalo nổi bật */}
            <ZaloIcon size={isMobile ? 32 : 36} />
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '10px',
                border: '1.5px solid #FFFFFF',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                lineHeight: 1
              }}
            >
              Zalo
            </span>
          </a>

          {/* B. NÚT MESSENGER NẰM PHÍA DƯỚI */}
          <button
            onClick={toggleChat}
            aria-label="Mở chat tư vấn Facebook Messenger"
            title="Chat trực tiếp với nhân viên tư vấn qua Facebook"
            style={{
              width: btnSize,
              height: btnSize,
              borderRadius: '50%',
              backgroundColor: '#0084FF',
              color: '#FFFFFF',
              border: '2px solid #FFFFFF',
              boxShadow: '0 6px 20px rgba(0, 132, 255, 0.4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              touchAction: 'manipulation'
            }}
            onMouseEnter={(e) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.08)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 132, 255, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 132, 255, 0.4)';
              }
            }}
          >
            <MessageCircle size={isMobile ? 26 : 28} />
          </button>
        </>
      )}

      {/* 2. CỬA SỔ CHAT TRỰC TIẾP VỚI NHÂN VIÊN (HỖ TRỢ CẢ ZALO & MESSENGER) */}
      {isOpen && (
        <div
          style={
            isMobile
              ? {
                  width: '100vw',
                  height: '100dvh',
                  backgroundColor: '#FAF8F5',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }
              : {
                  width: '360px',
                  maxWidth: 'calc(100vw - 32px)',
                  backgroundColor: '#FAF8F5',
                  borderRadius: '18px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
                  border: '1px solid #E5E7EB',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  transformOrigin: 'bottom right'
                }
          }
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 18px',
              background: 'linear-gradient(135deg, #0068FF 0%, #0084FF 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0, 104, 255, 0.25)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  color: '#0068FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.95rem'
                }}
              >
                <MessageCircle size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, letterSpacing: '0.3px' }}>
                  TƯ VẤN VIÊN TAVY
                </div>
                <div style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '5px', opacity: 0.95 }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#4ADE80', display: 'inline-block' }} />
                  Đang trực tuyến hỗ trợ 24/7
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Đóng cửa sổ chat"
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: '#FFFFFF',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s ease'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div
            style={{
              padding: isMobile ? '20px 16px' : '22px 18px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '14px',
              overflowY: 'auto'
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                width: '100%'
              }}
            >
              <p style={{ fontSize: '0.9rem', color: '#1F2937', lineHeight: '1.6', margin: 0, fontWeight: 600 }}>
                Xin chào! Bạn cần tìm mua mỹ phẩm, sâm nấm, thuốc nội địa Hàn hoặc muốn báo giá sản phẩm ngoài hệ thống?
              </p>
              <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: '8px 0 0 0', lineHeight: '1.5' }}>
                Hãy gửi ảnh hoặc link sản phẩm qua Zalo hoặc Messenger, nhân viên tại Hàn Quốc sẽ kiểm tra giá và tư vấn ngay cho bạn.
              </p>
            </div>

            {/* Feature Pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', fontSize: '0.8rem', color: '#1D4ED8', textAlign: 'left' }}>
                <Clock size={16} style={{ flexShrink: 0 }} />
                <span>Phản hồi trực tiếp trong <strong>1 - 3 phút</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: '0.8rem', color: '#15803D', textAlign: 'left' }}>
                <ShieldCheck size={16} style={{ flexShrink: 0 }} />
                <span>Mua hộ mọi sản phẩm từ <strong>Store & Hiệu thuốc Hàn</strong></span>
              </div>
            </div>

            {/* Action Buttons: Zalo & Messenger */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '4px' }}>
              {/* Nút Chat Zalo */}
              <a
                href={zaloChatUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '13px 20px',
                  borderRadius: '30px',
                  backgroundColor: '#0068FF',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(0, 104, 255, 0.35)',
                  transition: 'all 0.2s ease',
                  touchAction: 'manipulation'
                }}
              >
                <ZaloIcon size={20} />
                <span>Nhắn tin tư vấn qua Zalo</span>
                <ExternalLink size={14} style={{ opacity: 0.8 }} />
              </a>

              {/* Nút Chat Messenger */}
              <a
                href={facebookMessengerUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '30px',
                  backgroundColor: '#0084FF',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(0, 132, 255, 0.3)',
                  transition: 'all 0.2s ease',
                  touchAction: 'manipulation'
                }}
              >
                <Send size={15} />
                <span>Chat qua Messenger</span>
                <ExternalLink size={14} style={{ opacity: 0.8 }} />
              </a>

              {/* Link Trang Facebook */}
              <a
                href={facebookProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '30px',
                  backgroundColor: '#FFFFFF',
                  color: '#4B5563',
                  border: '1px solid #D1D5DB',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  textDecoration: 'none'
                }}
              >
                <span>Xem Trang Facebook TAVY Korea</span>
              </a>
            </div>

            {/* Hotline & Zalo */}
            <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #E5E7EB', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.78rem', color: '#6B7280' }}>
              <Phone size={13} />
              <span>Hotline & Zalo: <strong>{displayZaloPhone}</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
