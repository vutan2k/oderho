import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ChatHeader from './ChatHeader';
import BotChatView from './BotChatView';
import FacebookChatEmbed from './FacebookChatEmbed';
import { MessageCircle, X, Sparkles } from 'lucide-react';

export default function ChatWidget() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('bot'); // 'bot' | 'facebook'
  const [hasNewPrompt, setHasNewPrompt] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Không hiển thị ChatWidget trong toàn bộ các trang Admin
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Detect Mobile Viewport dynamically
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
    if (!isOpen) {
      setHasNewPrompt(false);
    }
  };

  const handleReset = () => {
    setActiveTab('bot');
  };

  // Close with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Lock body scroll on mobile when chat is opened for full screen modal feel
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

  // Ẩn hoàn toàn trên các trang Admin
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
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }
          : {
              position: 'fixed',
              bottom: isMobile ? '80px' : '100px', // Nâng cao gấp đôi so với ban đầu (100px desktop, 80px mobile)
              right: isMobile ? '14px' : '20px',
              zIndex: 9995,
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }
      }
    >
      {/* 1. Floating Toggle Button with Pulse Badge */}
      {!isOpen && (
        <div style={{ position: 'relative' }}>
          {hasNewPrompt && (
            <div
              style={{
                position: 'absolute',
                bottom: '68px',
                right: '0',
                backgroundColor: '#1E1B4B',
                color: '#FFFFFF',
                padding: '7px 12px',
                borderRadius: '12px',
                fontSize: isMobile ? '0.72rem' : '0.78rem',
                fontWeight: 600,
                boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
                whiteSpace: 'nowrap',
                border: '1px solid rgba(255,255,255,0.15)',
                animation: 'bounce 2s infinite',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                maxWidth: 'calc(100vw - 40px)'
              }}
            >
              <Sparkles size={13} color="#A78BFA" />
              <span>Cần hỗ trợ? <strong>Chat ngay</strong></span>
            </div>
          )}

          <button
            onClick={toggleChat}
            aria-label="Mở cửa sổ chat hỗ trợ TAVY"
            title="Chat hỗ trợ & Tra cứu đơn hàng 8 bước"
            style={{
              width: isMobile ? '52px' : '58px',
              height: isMobile ? '52px' : '58px',
              borderRadius: '50%',
              backgroundColor: 'var(--purple-primary)',
              color: '#FFFFFF',
              border: '2px solid #FFFFFF',
              boxShadow: '0 6px 20px rgba(122, 75, 158, 0.4)',
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
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(122, 75, 158, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(122, 75, 158, 0.4)';
              }
            }}
          >
            <MessageCircle size={isMobile ? 25 : 28} />
          </button>
        </div>
      )}

      {/* 2. Main Chat Popup Window (Responsive Mobile Friendly) */}
      {isOpen && (
        <div
          style={
            isMobile
              ? {
                  width: '100vw',
                  height: '100dvh', // Full màn hình chuẩn trên mobile Safari/Chrome
                  backgroundColor: '#FAF9F6',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }
              : {
                  width: '370px',
                  maxWidth: 'calc(100vw - 32px)',
                  height: '540px',
                  maxHeight: 'calc(100vh - 120px)',
                  backgroundColor: '#FAF9F6',
                  borderRadius: '16px',
                  boxShadow: '0 15px 40px rgba(0,0,0,0.25)',
                  border: '1px solid #E5E7EB',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  animation: 'fadeIn 0.2s ease'
                }
          }
        >
          {/* Header */}
          <ChatHeader
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onClose={() => setIsOpen(false)}
            onReset={handleReset}
            isMobile={isMobile}
          />

          {/* Body Area */}
          <div
            style={{
              flex: 1,
              padding: isMobile ? '12px' : '14px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {activeTab === 'bot' ? (
              <BotChatView
                onSwitchToFacebook={() => setActiveTab('facebook')}
                isMobile={isMobile}
              />
            ) : (
              <FacebookChatEmbed isMobile={isMobile} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
