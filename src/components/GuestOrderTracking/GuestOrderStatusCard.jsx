import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check, X, Copy, CreditCard, Video, FileText,
  PackageCheck, Plane, Truck, Scale, ShieldCheck,
  Calendar, User, Package, AlertCircle, Info
} from 'lucide-react';
import { ORDER_STEPS, getStatusConfig } from '../../data/orderStatuses';
import { calculateStepProgress, getProofBadges } from '../../services/guestTrackingService';
import { getOrderTotalVnd, formatVnd } from '../../utils/priceCalculator';
import ProofMediaModal from './ProofMediaModal';

/**
 * GuestOrderStatusCard
 * Displays rich 8-step visual timeline, transparent proof hub,
 * multi-order tab switcher, item summary, and payment CTA for guest tracking.
 */
export default function GuestOrderStatusCard({
  order,
  matchedOrders = [],
  selectedOrderIndex = 0,
  onSelectOrder,
  onClose,
  rates
}) {
  const [copiedCode, setCopiedCode] = useState('');
  const [activeMedia, setActiveMedia] = useState(null);

  if (!order) return null;

  const krwRate = rates?.KRW?.rate || 19.5;
  const serviceFeeMultiplier = 1 + (rates?.serviceFeePercent ?? 5) / 100;

  const formatVnd = (amount) => {
    if (amount == null || isNaN(amount)) return '0 VNĐ';
    return `${new Intl.NumberFormat('vi-VN').format(Math.round(amount))} VNĐ`;
  };

  const handleCopyCode = (code, e) => {
    if (e) e.stopPropagation();
    if (!code) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  const statusCfg = getStatusConfig(order.status);
  const stepProgress = calculateStepProgress(order);
  const currentStepIdx = stepProgress.stepIndex;
  const isCancelled = stepProgress.isCancelled;
  const proofData = getProofBadges(order);

  // Compute total VND amount
  const totalOrderVnd = getOrderTotalVnd(order, rates);

  // Items list
  const items = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : [{
        productId: order.id,
        name: order.productName || 'Sản phẩm mua hộ Hàn Quốc',
        brand: order.brand || 'Olive Young',
        productImage: order.productImage || '/tavy-logo.png',
        options: order.options || 'Mặc định',
        qty: order.quantity || 1,
        price: totalOrderVnd
      }];

  const isUnpaid = (
    order.status === 'pending' ||
    order.paymentStatus === 'pending' ||
    !order.paymentStatus ||
    order.paymentStatus === 'unpaid'
  );

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Mới tạo gần đây';

  return (
    <div
      className="guest-order-status-card"
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid var(--border-color, #E5E7EB)',
        boxShadow: '0 12px 32px rgba(122, 75, 158, 0.08), 0 2px 8px rgba(0,0,0,0.04)',
        overflow: 'hidden',
        margin: '24px 0 36px 0',
        transition: 'all 0.3s ease'
      }}
    >
      {/* 1. Header Bar: Order ID, Customer Name, Date, Status Badge, Close */}
      <div
        style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #FAF8F5 0%, #F5EFF8 100%)',
          borderBottom: '1px solid #ECE7F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '1.2rem',
                fontWeight: 800,
                color: 'var(--purple-primary, #7A4B9E)',
                letterSpacing: '0.5px'
              }}
            >
              #{order.id}
            </span>

            {/* Status Badge */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 700,
                backgroundColor: statusCfg.bgColor || '#F3F4F6',
                color: statusCfg.color || '#374151',
                border: `1px solid ${statusCfg.borderColor || '#E5E7EB'}`
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: statusCfg.color || '#374151',
                  display: 'inline-block'
                }}
              />
              {statusCfg.label}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
              fontSize: '0.84rem',
              color: 'var(--text-muted, #6B7280)'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <User size={14} style={{ color: 'var(--purple-primary, #7A4B9E)' }} />
              <strong>{order.customerName || order.userName || 'Khách Hàng'}</strong>
              {(order.customerPhone || order.phone) && ` • ${order.customerPhone || order.phone}`}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={14} />
              {formattedDate}
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            aria-label="Đóng bảng tra cứu"
            title="Đóng bảng tra cứu"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: '24px',
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#4B5563',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FEE2E2';
              e.currentTarget.style.borderColor = '#FCA5A5';
              e.currentTarget.style.color = '#DC2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = '#D1D5DB';
              e.currentTarget.style.color = '#4B5563';
            }}
          >
            <X size={16} /> Đóng tra cứu
          </button>
        )}
      </div>

      {/* 2. Multi-Order Tab Switcher (When multiple orders match the same phone) */}
      {matchedOrders && matchedOrders.length > 1 && (
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>
            Tìm thấy {matchedOrders.length} đơn hàng:
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap' }}>
            {matchedOrders.map((mOrder, idx) => {
              const isActive = idx === selectedOrderIndex;
              const mCfg = getStatusConfig(mOrder.status);
              return (
                <button
                  key={mOrder.id || idx}
                  onClick={() => onSelectOrder && onSelectOrder(idx)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '16px',
                    border: isActive ? '2px solid var(--purple-primary, #7A4B9E)' : '1px solid #CBD5E1',
                    backgroundColor: isActive ? 'var(--purple-primary, #7A4B9E)' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#334155',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: isActive ? '0 2px 6px rgba(122, 75, 158, 0.25)' : 'none',
                    transition: 'all 0.15s ease',
                    flexShrink: 0
                  }}
                >
                  <span>
                    {idx === 0 ? 'Đơn mới nhất' : `Đơn #${idx + 1}`} ({mOrder.id})
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : mCfg.bgColor,
                      color: isActive ? '#FFFFFF' : mCfg.color
                    }}
                  >
                    {mCfg.shortLabel || mCfg.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Visual 8-Step Timeline Section */}
      <div style={{ padding: '28px 24px 24px 24px', backgroundColor: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--text-dark, #1F2937)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ShieldCheck size={20} style={{ color: 'var(--purple-primary, #7A4B9E)' }} />
              Tiến Trình Mua Hộ 8 Bước Minh Bạch
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #6B7280)', margin: '4px 0 0 0' }}>
              Cập nhật trực tiếp từ kho Seoul, chuyến bay Incheon và vận chuyển nội địa Việt Nam.
            </p>
          </div>

          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: isCancelled ? '#DC2626' : 'var(--purple-primary, #7A4B9E)',
              backgroundColor: isCancelled ? '#FEE2E2' : 'var(--purple-light, #F0E8F5)',
              padding: '4px 12px',
              borderRadius: '12px'
            }}
          >
            {isCancelled ? 'ĐÃ HỦY' : `Tiến độ: ${stepProgress.progressPercent}`}
          </span>
        </div>

        {/* Stepper Container */}
        {isCancelled ? (
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #F87171',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#991B1B'
            }}
          >
            <AlertCircle size={24} style={{ flexShrink: 0 }} />
            <div>
              <strong>Đơn hàng này đã bị hủy.</strong>
              <div style={{ fontSize: '0.84rem', marginTop: '2px', color: '#B91C1C' }}>
                Nếu quý khách có thắc mắc hoặc cần hoàn tiền cọc, vui lòng liên hệ hotline/Zalo CSKH: 0935 861 690.
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Horizontal Stepper */}
            <div
              style={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: '8px',
                marginBottom: '24px',
                overflowX: 'auto',
                paddingBottom: '8px',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {/* Stepper Progress Track */}
              <div
                style={{
                  position: 'absolute',
                  top: '18px',
                  left: '6%',
                  right: '6%',
                  height: '4px',
                  backgroundColor: '#E5E7EB',
                  zIndex: 1
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: stepProgress.progressPercent,
                    backgroundColor: 'var(--purple-primary, #7A4B9E)',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>

              {ORDER_STEPS.map((step, idx) => {
                const isCompleted = currentStepIdx > idx || currentStepIdx === 7;
                const isActive = currentStepIdx === idx && currentStepIdx < 7;

                let circleBg = '#F3F4F6';
                let circleColor = '#9CA3AF';
                let circleBorder = '2px solid #D1D5DB';

                if (isCompleted) {
                  circleBg = 'var(--purple-primary, #7A4B9E)';
                  circleColor = '#FFFFFF';
                  circleBorder = '2px solid var(--purple-primary, #7A4B9E)';
                } else if (isActive) {
                  circleBg = '#FFFFFF';
                  circleColor = 'var(--purple-primary, #7A4B9E)';
                  circleBorder = '3px solid var(--purple-primary, #7A4B9E)';
                }

                return (
                  <div
                    key={step.key}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      zIndex: 2,
                      minWidth: '70px',
                      textAlign: 'center'
                    }}
                  >
                    {/* Step Circle */}
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: circleBg,
                        color: circleColor,
                        border: circleBorder,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        boxShadow: isActive ? '0 0 0 4px rgba(122, 75, 158, 0.2)' : '0 2px 4px rgba(0,0,0,0.06)',
                        transition: 'all 0.2s ease',
                        marginBottom: '8px'
                      }}
                    >
                      {isCompleted ? <Check size={18} strokeWidth={3} /> : step.step}
                    </div>

                    {/* Step Short Label */}
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: isActive ? 800 : (isCompleted ? 600 : 500),
                        color: isActive
                          ? 'var(--purple-primary, #7A4B9E)'
                          : (isCompleted ? 'var(--text-dark, #1F2937)' : 'var(--text-muted, #9CA3AF)'),
                        lineHeight: 1.2
                      }}
                    >
                      {step.shortLabel || step.title}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Current Active Step Highlight Card */}
            <div
              style={{
                padding: '16px 20px',
                borderRadius: '14px',
                backgroundColor: statusCfg.bgColor || '#F9FAFB',
                border: `1px solid ${statusCfg.borderColor || '#E5E7EB'}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: statusCfg.color || '#7A4B9E',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  flexShrink: 0,
                  marginTop: '2px'
                }}
              >
                {stepProgress.stepNumber}
              </div>
              <div style={{ flex: 1 }}>
                <h4
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: statusCfg.color || '#1F2937',
                    margin: '0 0 4px 0'
                  }}
                >
                  {statusCfg.label}
                </h4>
                <p style={{ fontSize: '0.84rem', color: '#4B5563', margin: 0, lineHeight: 1.4 }}>
                  {statusCfg.desc || 'Đơn hàng đang được bộ phận vận hành TAVY xử lý chuyên nghiệp.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Transparent Proof Hub */}
      <div
        style={{
          padding: '20px 24px',
          backgroundColor: '#FAF9F6',
          borderTop: '1px solid #ECE7F0',
          borderBottom: '1px solid #ECE7F0'
        }}
      >
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h4
            style={{
              fontSize: '0.92rem',
              fontWeight: 700,
              color: 'var(--text-dark, #1F2937)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🛡️ Bằng Chứng Minh Bạch & Mã Vận Đơn
          </h4>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #6B7280)' }}>
            Cam kết hàng Store thật 100%
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          {/* POV Video Button */}
          {proofData.povVideoUrl ? (
            <button
              onClick={() =>
                setActiveMedia({
                  type: 'video',
                  badgeType: 'pov_video',
                  url: proofData.povVideoUrl,
                  title: `Video POV Mua Hàng Tại Store — Đơn #${order.id}`,
                  subtitle: 'Nhân viên TAVY trực tiếp ghé kệ Olive Young / Store Hàn Quốc'
                })
              }
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '8px 16px',
                borderRadius: '10px',
                backgroundColor: '#F3E8FF',
                color: '#7C3AED',
                border: '1px solid #8B5CF6',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(124, 58, 237, 0.12)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E9D5FF')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F3E8FF')}
            >
              <Video size={16} /> Xem Video POV Store
            </button>
          ) : null}

          {/* Receipt Bill Image Button */}
          {proofData.receiptImageUrl ? (
            <button
              onClick={() =>
                setActiveMedia({
                  type: 'image',
                  badgeType: 'receipt_bill',
                  url: proofData.receiptImageUrl,
                  title: `Hóa Đơn Bill Store — Đơn #${order.id}`,
                  subtitle: 'Hóa đơn gốc xuất từ quầy thanh toán Olive Young / Cửa hàng Hàn Quốc'
                })
              }
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '8px 16px',
                borderRadius: '10px',
                backgroundColor: '#F3F4F6',
                color: '#374151',
                border: '1px solid #9CA3AF',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E5E7EB')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F3F4F6')}
            >
              <FileText size={16} /> Xem Hóa Đơn Bill
            </button>
          ) : null}

          {/* Packing Video Button */}
          {proofData.packingVideoUrl ? (
            <button
              onClick={() =>
                setActiveMedia({
                  type: 'video',
                  badgeType: 'packing_video',
                  url: proofData.packingVideoUrl,
                  title: `Video Đóng Kiện & Cân Nặng — Đơn #${order.id}`,
                  subtitle: 'Bọc chống sốc 3 lớp, kiểm tra seal và niêm phong tại kho Seoul'
                })
              }
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '8px 16px',
                borderRadius: '10px',
                backgroundColor: '#FCE7F3',
                color: '#DB2777',
                border: '1px solid #EC4899',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(219, 39, 119, 0.12)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FBCFE8')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FCE7F3')}
            >
              <PackageCheck size={16} /> Xem Video Đóng Gói
            </button>
          ) : null}

          {/* Package Weight Badge */}
          {proofData.packageWeightKg != null && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                backgroundColor: '#ECFDF5',
                color: '#047857',
                border: '1px solid #10B981',
                fontWeight: 700,
                fontSize: '0.82rem'
              }}
            >
              <Scale size={16} /> Cân nặng: {proofData.packageWeightKg} kg
            </span>
          )}

          {/* Flight Code Badge */}
          {proofData.flightCode && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                backgroundColor: '#CFFAFE',
                color: '#0891B2',
                border: '1px solid #06B6D4',
                fontWeight: 700,
                fontSize: '0.82rem'
              }}
            >
              <Plane size={16} /> Chuyến bay: {proofData.flightCode}
            </span>
          )}

          {/* Air AWB Tracking */}
          {proofData.trackingCode && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '10px',
                backgroundColor: '#E0F2FE',
                color: '#0284C7',
                border: '1px solid #38BDF8',
                fontWeight: 600,
                fontSize: '0.82rem'
              }}
            >
              <Plane size={16} />
              <span>AWB Air: <strong>{proofData.trackingCode}</strong></span>
              <button
                onClick={(e) => handleCopyCode(proofData.trackingCode, e)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#0284C7',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Sao chép mã AWB"
              >
                {copiedCode === proofData.trackingCode ? <Check size={14} color="#059669" /> : <Copy size={14} />}
              </button>
            </div>
          )}

          {/* Domestic Tracking */}
          {proofData.domesticTrackingCode && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '10px',
                backgroundColor: '#D1FAE5',
                color: '#065F46',
                border: '1px solid #10B981',
                fontWeight: 600,
                fontSize: '0.82rem'
              }}
            >
              <Truck size={16} style={{ color: '#059669' }} />
              <span>
                {proofData.domesticCarrier || 'Vận đơn VN'}: <strong>{proofData.domesticTrackingCode}</strong>
              </span>
              <button
                onClick={(e) => handleCopyCode(proofData.domesticTrackingCode, e)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: copiedCode === proofData.domesticTrackingCode ? '#059669' : '#047857',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'background-color 0.15s ease'
                }}
              >
                {copiedCode === proofData.domesticTrackingCode ? (
                  <>
                    <Check size={12} /> Đã chép!
                  </>
                ) : (
                  <>
                    <Copy size={12} /> Sao chép
                  </>
                )}
              </button>
            </div>
          )}

          {/* If no proof media yet */}
          {!proofData.hasProof && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.82rem',
                color: '#6B7280',
                fontStyle: 'italic',
                padding: '6px 0'
              }}
            >
              <Info size={16} style={{ color: '#9CA3AF' }} />
              Bằng chứng video POV Store, bill thanh toán và mã vận đơn sẽ được tự động tải lên khi đơn hàng được mua và đóng kiện tại Seoul.
            </div>
          )}
        </div>
      </div>

      {/* 5. Order Summary (Items & Total Amount) */}
      <div style={{ padding: '20px 24px', backgroundColor: '#FFFFFF' }}>
        <h4
          style={{
            fontSize: '0.92rem',
            fontWeight: 700,
            color: 'var(--text-dark, #1F2937)',
            margin: '0 0 14px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Package size={18} style={{ color: 'var(--purple-primary, #7A4B9E)' }} />
          Chi Tiết Sản Phẩm Trong Đơn Hàng
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
          {items.map((item, iIdx) => {
            const itemPrice = item.price || Math.round((item.foreignPrice || 0) * krwRate * serviceFeeMultiplier);
            const itemQty = item.qty || item.quantity || 1;
            const lineTotal = itemPrice * itemQty;

            return (
              <div
                key={item.productId || iIdx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: '#FAF9F6',
                  border: '1px solid #EAE6DF',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px', flex: 1 }}>
                  <img
                    src={item.productImage || item.image || '/tavy-logo.png'}
                    alt={item.name || 'Sản phẩm'}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: '1px solid #E5E7EB',
                      backgroundColor: '#FFFFFF',
                      flexShrink: 0
                    }}
                    onError={(e) => {
                      e.currentTarget.src = '/tavy-logo.png';
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1F2937' }}>
                      {item.name || item.productName || 'Sản phẩm mua hộ Hàn Quốc'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>
                      {item.brand && <span style={{ fontWeight: 600, color: 'var(--purple-primary, #7A4B9E)' }}>{item.brand}</span>}
                      {item.options && <span> • Phân loại: {item.options}</span>}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', minWidth: '120px' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1F2937' }}>
                    {formatVnd(lineTotal)}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                    {formatVnd(itemPrice)} × {itemQty}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total & Action Footer */}
        <div
          style={{
            paddingTop: '16px',
            borderTop: '1px dashed #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px'
          }}
        >
          <div>
            <div style={{ fontSize: '0.82rem', color: '#6B7280' }}>Tổng thanh toán đơn hàng</div>
            <div
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: 'var(--purple-primary, #7A4B9E)',
                letterSpacing: '0.2px'
              }}
            >
              {formatVnd(totalOrderVnd)}
            </div>
          </div>

          {/* Payment CTA for unpaid / pending orders */}
          {isUnpaid && !isCancelled && (
            <Link
              to={`/payment/${order.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '30px',
                backgroundColor: 'var(--gold-primary, #C5A059)',
                color: '#FFFFFF',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.92rem',
                boxShadow: '0 4px 14px rgba(197, 160, 89, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              <CreditCard size={18} />
              Thanh toán cọc ngay
            </Link>
          )}
        </div>
      </div>

      {/* Proof Media Lightbox Modal */}
      {activeMedia && (
        <ProofMediaModal
          media={activeMedia}
          onClose={() => setActiveMedia(null)}
        />
      )}
    </div>
  );
}
