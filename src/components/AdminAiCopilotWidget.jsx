import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from './Toast';
import { sendAdminCopilotMessage } from '../services/adminAiCopilotService';
import {
  Sparkles,
  Bot,
  X,
  Send,
  Minimize2,
  Maximize2,
  Trash2,
  Copy,
  Check,
  Zap,
  ArrowRight,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export default function AdminAiCopilotWidget() {
  const {
    orders,
    products,
    pendingProducts,
    rates,
    updateRates,
    addProduct,
    addPendingProduct
  } = useContext(AppContext);
  const showToast = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('tavy_admin_copilot_chat');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        role: 'assistant',
        content: `👋 Xin chào Quản Trị Viên! Tôi là **Tavy AI Admin Copilot**.\n\nTôi có thể giúp bạn:\n1. 🌿 **Cào & phân tích sản phẩm** từ Naver Brand Store, KGC, Olive Young.\n2. 📊 **Kiểm tra tiến độ đơn hàng** và tóm tắt việc cần làm ngay.\n3. 💬 **Soạn tin nhắn báo giá / chăm sóc khách hàng** chuyên nghiệp.\n4. 💱 **Tư vấn điều chỉnh tỷ giá Won và phí dịch vụ**.\n\nHãy nhập yêu cầu hoặc dán link bất kỳ bên dưới!`,
        timestamp: new Date().toISOString()
      }
    ];
  });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('tavy_admin_copilot_chat', JSON.stringify(messages.slice(-30)));
    } catch {}
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  const urgentQueue = {
    needQuote: orders.filter(o => o.status === 'pending'),
    needPurchase: orders.filter(o => o.status === 'deposit_paid' || o.status === 'paid')
  };

  const handleSend = async (customPrompt = '') => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = {
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInputText('');
    setIsLoading(true);

    try {
      const reply = await sendAdminCopilotMessage({
        userMessage: textToSend.trim(),
        chatHistory: messages,
        contextData: {
          orders,
          products,
          pendingProducts,
          rates,
          urgentQueue
        }
      });

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: reply.content,
          action: reply.action,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Đã xảy ra lỗi kết nối với mô hình AI. Vui lòng thử lại sau ít giây.',
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteAction = (action) => {
    if (!action) return;
    if (action.type === 'IMPORT_HEALTH_PRODUCT' || action.type === 'IMPORT_PRODUCT') {
      const prod = action.product;
      if (prod) {
        addProduct({
          goodsNo: prod.goodsNo || `P-${Date.now()}`,
          name: prod.name,
          nameKr: prod.koreanTitle || prod.nameKr || '',
          brand: prod.brand,
          category: prod.category || 'health',
          foreignPrice: prod.foreignPrice || 0,
          price: prod.foreignPrice || 0,
          productImage: prod.productImage,
          images: prod.images || [prod.productImage],
          rating: prod.rating || 4.9,
          reviewsCount: prod.reviewsCount || 100,
          origin: prod.origin || 'Hàn Quốc',
          description: prod.description || '',
          usage: prod.usage || '',
          activeIngredients: prod.activeIngredients || [],
          isVerifiedHealthFood: true,
          isGmpCertified: true
        });
        if (showToast) showToast(`Đã thêm "${prod.name}" vào Kho Hàng Live thành công!`, 'success');
      }
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
    if (showToast) showToast('Đã sao chép vào bộ nhớ tạm!', 'info');
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: 'assistant',
        content: '🧹 Đã xóa lịch sử trò chuyện. Tôi có thể giúp gì tiếp cho bạn?',
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const quickPrompts = [
    { label: '🌿 Cào Sâm Naver', prompt: 'Cào sản phẩm sâm bán chạy trên Naver Brand Store giúp tôi: https://brand.naver.com/kgcshop/products/10556547785' },
    { label: '📊 Việc cần làm hôm nay', prompt: 'Tóm tắt tình hình các đơn hàng cần xử lý gấp hôm nay (báo giá, mua hàng Hàn Quốc).' },
    { label: '💱 Tư vấn tỷ giá Won', prompt: 'Tỷ giá KRW hiện tại là bao nhiêu? Có cần điều chỉnh tỷ giá và phí dịch vụ không?' },
    { label: '💬 Soạn tin nhắn báo giá', prompt: 'Hãy soạn mẫu tin nhắn Zalo thông báo báo giá và link thanh toán cọc cho khách hàng.' }
  ];

  return (
    <>
      {/* 🚀 Floating Launch Button */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#0F172A',
            color: '#FFF',
            border: '2px solid #3B82F6',
            borderRadius: '9999px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: '0.9rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Sparkles size={20} color="#60A5FA" />
            <span style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              width: '8px',
              height: '8px',
              backgroundColor: '#10B981',
              borderRadius: '50%',
              boxShadow: '0 0 8px #10B981'
            }} />
          </div>
          <span>AI Admin Copilot</span>
        </button>
      )}

      {/* 💬 Copilot Chat Modal / Drawer */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: 'min(460px, calc(100vw - 40px))',
          height: isMinimized ? '60px' : 'min(620px, calc(100vh - 40px))',
          backgroundColor: '#FFF',
          borderRadius: '16px',
          boxShadow: '0 20px 35px -10px rgba(15, 23, 42, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.08)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'height 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          fontFamily: 'inherit'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#0F172A',
            color: '#FFF',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1E293B'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={16} color="#60A5FA" />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Tavy AI Admin Copilot</span>
                  <span style={{ fontSize: '0.65rem', backgroundColor: '#059669', padding: '1px 6px', borderRadius: '4px', color: '#FFF' }}>
                    ONLINE
                  </span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Trợ lý Quản trị & Vận hành Sàn Hàn Quốc</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={handleClearHistory}
                title="Xóa lịch sử trò chuyện"
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
              >
                <Trash2 size={15} />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
              >
                {isMinimized ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Đóng"
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Quick Prompts Bar */}
              <div style={{
                padding: '8px 12px',
                backgroundColor: '#F8FAFC',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                whiteSpace: 'nowrap'
              }}>
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(qp.prompt)}
                    style={{
                      backgroundColor: '#FFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '12px',
                      padding: '4px 10px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: '#334155',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {qp.label}
                  </button>
                ))}
              </div>

              {/* Messages Body */}
              <div style={{
                flex: 1,
                padding: '14px',
                overflowY: 'auto',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {messages.map((m, idx) => {
                  const isUser = m.role === 'user';
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isUser ? 'flex-end' : 'flex-start',
                        maxWidth: '100%'
                      }}
                    >
                      <div style={{
                        maxWidth: '88%',
                        padding: '10px 14px',
                        borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        backgroundColor: isUser ? '#2563EB' : '#FFF',
                        color: isUser ? '#FFF' : '#1E293B',
                        fontSize: '0.82rem',
                        lineHeight: 1.5,
                        boxShadow: isUser ? '0 2px 6px rgba(37, 99, 235, 0.2)' : '0 2px 6px rgba(0, 0, 0, 0.05)',
                        border: isUser ? 'none' : '1px solid #E2E8F0',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {m.content}

                        {/* Interactive Action Card from AI */}
                        {m.action && (
                          <div style={{
                            marginTop: '10px',
                            paddingTop: '8px',
                            borderTop: '1px dashed #CBD5E1',
                            display: 'flex',
                            gap: '6px'
                          }}>
                            <button
                              onClick={() => handleExecuteAction(m.action)}
                              style={{
                                backgroundColor: '#10B981',
                                color: '#FFF',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <Zap size={13} />
                              Nhập vào Kho Hàng Live ngay
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Copy Action Button */}
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(m.content, idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#94A3B8',
                            fontSize: '0.68rem',
                            cursor: 'pointer',
                            marginTop: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          {copiedIdx === idx ? <Check size={11} color="#10B981" /> : <Copy size={11} />}
                          <span>{copiedIdx === idx ? 'Đã sao chép' : 'Sao chép'}</span>
                        </button>
                      )}
                    </div>
                  );
                })}

                {isLoading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '0.78rem' }}>
                    <RefreshCw size={14} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                    <span>AI Copilot đang xử lý và phân tích...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <div style={{
                padding: '10px 12px',
                backgroundColor: '#FFF',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                gap: '8px'
              }}>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Nhập yêu cầu, hỏi về đơn hàng hoặc dán link Naver/KGC..."
                  rows={2}
                  style={{
                    flex: 1,
                    resize: 'none',
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!inputText.trim() || isLoading}
                  style={{
                    backgroundColor: inputText.trim() && !isLoading ? '#2563EB' : '#94A3B8',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0 14px',
                    cursor: inputText.trim() && !isLoading ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
