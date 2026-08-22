import React, { useState } from 'react';
import { CHATBOT_QUICK_ACTIONS, CHATBOT_REPLIES } from '../../data/chatbotFaqData';
import {
  Bot,
  User,
  PackageSearch,
  Sparkles,
  Plane,
  ShieldCheck,
  CreditCard,
  MessageCircle,
  RotateCcw
} from 'lucide-react';
import OrderTrackerLookup from './OrderTrackerLookup';
import ProductConsultView from './ProductConsultView';

const ICONS_MAP = {
  PackageSearch,
  Sparkles,
  Plane,
  ShieldCheck,
  CreditCard,
  MessageCircle
};

export default function BotChatView({ onSwitchToFacebook, isMobile }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome_1',
      sender: 'bot',
      text: 'Chào bạn! Chọn nhanh tiện ích bên dưới để được hỗ trợ tức thì:'
    }
  ]);
  const [currentView, setCurrentView] = useState(null); // null | 'lookup_order' | 'consult_product'

  const handleActionClick = (actionId) => {
    const action = CHATBOT_QUICK_ACTIONS.find(a => a.id === actionId);
    if (!action) return;

    if (action.actionType === 'tab' && action.tab === 'facebook') {
      onSwitchToFacebook?.();
      return;
    }

    if (action.actionType === 'view') {
      setCurrentView(action.view);
      return;
    }

    if (action.actionType === 'reply') {
      const replyData = CHATBOT_REPLIES[action.replyKey];
      if (!replyData) return;

      setMessages((prev) => [
        ...prev,
        {
          id: `user_${Date.now()}`,
          sender: 'user',
          text: action.label
        },
        {
          id: `bot_${Date.now() + 1}`,
          sender: 'bot',
          title: replyData.title,
          text: replyData.text
        }
      ]);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: 'bot',
        text: 'Chào bạn! Chọn nhanh tiện ích bên dưới:'
      }
    ]);
  };

  if (currentView === 'lookup_order') {
    return <OrderTrackerLookup onBack={() => setCurrentView(null)} isMobile={isMobile} />;
  }

  if (currentView === 'consult_product') {
    return <ProductConsultView onBack={() => setCurrentView(null)} isMobile={isMobile} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: isMobile ? '8px' : '10px' }}>
      {/* 1. Quick Action Grid Menu (To, Rõ, Tối Giản, Trực Quan) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: isMobile ? '6px' : '8px',
          padding: '2px 0 6px 0',
          borderBottom: '1px solid #E5E7EB'
        }}
      >
        {CHATBOT_QUICK_ACTIONS.map((action) => {
          const IconComponent = ICONS_MAP[action.icon] || Sparkles;
          return (
            <button
              key={action.id}
              onClick={() => handleActionClick(action.id)}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: isMobile ? '8px 2px' : '10px 4px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isMobile ? '4px' : '6px',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = action.color || 'var(--purple-primary)';
                  e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
                }
              }}
            >
              <div
                style={{
                  width: isMobile ? '34px' : '38px',
                  height: isMobile ? '34px' : '38px',
                  borderRadius: '10px',
                  backgroundColor: action.bgColor || '#FAF5FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: action.color || 'var(--purple-primary)'
                }}
              >
                <IconComponent size={isMobile ? 18 : 20} strokeWidth={2.2} />
              </div>
              <span
                style={{
                  fontSize: isMobile ? '0.75rem' : '0.8rem',
                  fontWeight: 600,
                  color: '#4B5563',
                  textAlign: 'center',
                  lineHeight: 1.2
                }}
              >
                {action.shortLabel || action.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Messages Conversation Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '8px' : '10px',
          paddingRight: '2px',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-end',
                justifyContent: isBot ? 'flex-start' : 'flex-end',
                animation: 'fadeIn 0.3s ease'
              }}
            >
              {isBot && (
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--purple-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 5px rgba(122, 75, 158, 0.2)'
                  }}
                >
                  <Bot size={15} color="#FFFFFF" />
                </div>
              )}

              <div
                style={{
                  maxWidth: isMobile ? '88%' : '85%',
                  backgroundColor: isBot ? '#FFFFFF' : 'var(--purple-primary)',
                  color: isBot ? '#1F2937' : '#FFFFFF',
                  padding: isMobile ? '10px 14px' : '12px 16px',
                  borderRadius: isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                  border: isBot ? '1px solid #E5E7EB' : 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  fontSize: isMobile ? '0.85rem' : '0.88rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-line'
                }}
              >
                {msg.title && (
                  <div style={{ fontWeight: 800, marginBottom: '6px', color: isBot ? 'var(--purple-primary)' : '#FFFFFF', fontSize: '0.9rem' }}>
                    {msg.title}
                  </div>
                )}
                <div>{msg.text}</div>
              </div>

              {!isBot && (
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#1E1B4B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 5px rgba(30, 27, 75, 0.2)'
                  }}
                >
                  <User size={15} color="#FFFFFF" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Bottom Reset Helper */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '2px' }}>
        <button
          onClick={handleClearChat}
          style={{
            background: 'none',
            border: 'none',
            color: '#9CA3AF',
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 6px',
            touchAction: 'manipulation'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--purple-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
        >
          <RotateCcw size={12} />
          <span>Làm mới</span>
        </button>
      </div>
    </div>
  );
}
