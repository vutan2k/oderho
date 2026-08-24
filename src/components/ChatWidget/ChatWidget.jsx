import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Send, ShieldCheck, Clock, ExternalLink, Phone } from 'lucide-react';

export default function ChatWidget() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
              bottom: isMobile ? '20px' : '24px',
              right: isMobile ? '16px' : '24px',
              zIndex: 9995,
              fontFamily: 'var(--font-sans, system-ui, sans-serif)'
            }
      }
    >
      {/* 1. Nút Tròn Mở Chat */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          aria-label="Mở chat tư vấn Facebook"
          title="Chat trực tiếp với nhân viên tư vấn qua Facebook"
          style={{
            width: isMobile ? '52px' : '58px',
            height: isMobile ? '52px' : '58px',
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
              e.currentTarget.style.transform = 'scale(1.08)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 132, 255, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isMobile) {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 132, 255, 0.4)';
            }
          }}
        >
          <MessageCircle size={isMobile ? 26 : 28} />
        </button>
      )}

      {/* 2. Cửa Sổ Chat Trực Tiếp Với Nhân Viên Qua Facebook */}
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
              backgroundColor: '#0084FF',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0, 132, 255, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  color: '#0084FF',
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
                  Đang trực tuyến hỗ trợ
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
              gap: '16px',
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
                Hãy gửi ảnh hoặc link sản phẩm qua Messenger, nhân viên tại Hàn Quốc sẽ kiểm tra giá và tư vấn ngay cho bạn.
              </p>
            </div>

            {/* Feature Pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', fontSize: '0.8rem', color: '#0369A1', textAlign: 'left' }}>
                <Clock size={16} style={{ flexShrink: 0 }} />
                <span>Phản hồi trực tiếp trong <strong>1 - 3 phút</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: '0.8rem', color: '#15803D', textAlign: 'left' }}>
                <ShieldCheck size={16} style={{ flexShrink: 0 }} />
                <span>Mua hộ mọi sản phẩm từ <strong>Store & Hiệu thuốc Hàn</strong></span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '4px' }}>
              <a
                href={facebookMessengerUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '13px 20px',
                  borderRadius: '30px',
                  backgroundColor: '#0084FF',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(0, 132, 255, 0.35)',
                  transition: 'all 0.2s ease',
                  touchAction: 'manipulation'
                }}
              >
                <Send size={16} />
                <span>Chat ngay qua Messenger</span>
                <ExternalLink size={14} style={{ opacity: 0.8 }} />
              </a>

              <a
                href={facebookProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 16px',
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

            {/* Hotline Hotline */}
            <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #E5E7EB', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.78rem', color: '#6B7280' }}>
              <Phone size={13} />
              <span>Hotline hỗ trợ: <strong>0988 888 888</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
