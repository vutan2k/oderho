/**
 * Centralized Order Status Definitions & Visual Tokens for TAVY KOREA
 * 8-Step Transparent Overseas Fulfillment Workflow
 */

export const ORDER_STATUSES = {
  pending: {
    id: 'pending',
    stepNumber: 1,
    label: 'Bước 1: Chọn hàng & Chờ cọc',
    shortLabel: 'Chờ cọc',
    color: '#D97706',
    bgColor: '#FEF3C7',
    borderColor: '#F59E0B',
    stepIndex: 0,
    desc: 'Quý khách chọn sản phẩm hoặc gửi link Olive Young / Musinsa.'
  },
  deposit_paid: {
    id: 'deposit_paid',
    stepNumber: 2,
    label: 'Bước 2: Đã cọc 100%',
    shortLabel: 'Đã cọc 100%',
    color: '#4F46E5',
    bgColor: '#EEF2FF',
    borderColor: '#6366F1',
    stepIndex: 1,
    desc: 'Khách hàng đã thanh toán cọc 100% tiền hàng thành công.'
  },
  confirmed: {
    id: 'confirmed',
    stepNumber: 3,
    label: 'Bước 3: TAVY Xác nhận đơn',
    shortLabel: 'Đã xác nhận',
    color: '#0284C7',
    bgColor: '#E0F2FE',
    borderColor: '#38BDF8',
    stepIndex: 2,
    desc: 'Admin kiểm tra sản phẩm, phân loại và lên lịch gom hàng tại Hàn Quốc.'
  },
  purchased: {
    id: 'purchased',
    stepNumber: 4,
    label: 'Bước 4: Mua hàng (Video POV)',
    shortLabel: 'Đang mua (POV)',
    color: '#7C3AED',
    bgColor: '#F3E8FF',
    borderColor: '#8B5CF6',
    stepIndex: 3,
    hasPovVideo: true,
    desc: 'Nhân viên TAVY trực tiếp mua hàng tại Store Hàn và quay video POV thực tế.'
  },
  packed_kr: {
    id: 'packed_kr',
    stepNumber: 5,
    label: 'Bước 5: Đóng hàng (Video Đóng Kiện)',
    shortLabel: 'Kho Seoul',
    color: '#DB2777',
    bgColor: '#FCE7F3',
    borderColor: '#EC4899',
    stepIndex: 4,
    hasPackingVideo: true,
    desc: 'Kiểm tra seal, bọc chống sốc 3 lớp, cân ký và quay video đóng thùng.'
  },
  in_transit_air: {
    id: 'in_transit_air',
    stepNumber: 6,
    label: 'Bước 6: Bay Air Hàn - Việt',
    shortLabel: 'Shipping Air',
    color: '#0891B2',
    bgColor: '#CFFAFE',
    borderColor: '#06B6D4',
    stepIndex: 5,
    desc: 'Hàng bay chuyên tuyến Incheon ✈️ Hà Nội / TP.HCM trong 3-5 ngày.'
  },
  customs_cleared: {
    id: 'customs_cleared',
    stepNumber: 7,
    label: 'Bước 7: Thông quan & Kho VN',
    shortLabel: 'Kho VN',
    color: '#0D9488',
    bgColor: '#CCFBF1',
    borderColor: '#14B8A6',
    stepIndex: 6,
    desc: 'Hoàn tất thủ tục hải quan chính ngạch, cập nhật mã vận đơn nội địa.'
  },
  completed: {
    id: 'completed',
    stepNumber: 8,
    label: 'Bước 8: Giao hàng & Tất toán',
    shortLabel: 'Đã giao',
    color: '#059669',
    bgColor: '#D1FAE5',
    borderColor: '#10B981',
    stepIndex: 7,
    desc: 'Giao hàng tận tay khách hàng, đồng kiểm và hoàn tất đơn hàng.'
  },
  // Trạng thái hủy
  cancelled: {
    id: 'cancelled',
    stepNumber: -1,
    label: 'Đã hủy đơn hàng',
    shortLabel: 'Đã hủy',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    borderColor: '#EF4444',
    stepIndex: -1,
    desc: 'Đơn hàng đã được hủy.'
  },
  // Backward compatibility alias cho legacy statuses nếu có
  quoted: {
    id: 'quoted',
    stepNumber: 2,
    label: 'Đã báo giá & Chờ cọc',
    shortLabel: 'Đã báo giá',
    color: '#0284C7',
    bgColor: '#E0F2FE',
    borderColor: '#38BDF8',
    stepIndex: 0,
    desc: 'Đã báo giá'
  },
  in_kr_warehouse: {
    id: 'in_kr_warehouse',
    stepNumber: 5,
    label: 'Kho Seoul',
    shortLabel: 'Kho Seoul',
    color: '#DB2777',
    bgColor: '#FCE7F3',
    borderColor: '#EC4899',
    stepIndex: 4,
    desc: 'Đã về kho Seoul'
  },
  transit: {
    id: 'transit',
    stepNumber: 6,
    label: 'Shipping Air',
    shortLabel: 'Shipping Air',
    color: '#0891B2',
    bgColor: '#CFFAFE',
    borderColor: '#06B6D4',
    stepIndex: 5,
    desc: 'Đang vận chuyển'
  },
  in_vn_warehouse: {
    id: 'in_vn_warehouse',
    stepNumber: 7,
    label: 'Kho VN',
    shortLabel: 'Kho VN',
    color: '#0D9488',
    bgColor: '#CCFBF1',
    borderColor: '#14B8A6',
    stepIndex: 6,
    desc: 'Kho VN'
  },
  delivering: {
    id: 'delivering',
    stepNumber: 8,
    label: 'Đang giao hàng',
    shortLabel: 'Đang giao',
    color: '#EA580C',
    bgColor: '#FFEDD5',
    borderColor: '#F97316',
    stepIndex: 7,
    desc: 'Đang giao hàng'
  }
};

export const getStatusConfig = (statusKey) => {
  return ORDER_STATUSES[statusKey] || {
    id: statusKey || 'pending',
    stepNumber: 1,
    label: statusKey || 'Chờ cọc',
    shortLabel: statusKey || 'Chờ cọc',
    color: '#4B5563',
    bgColor: '#F3F4F6',
    borderColor: '#9CA3AF',
    stepIndex: 0,
    desc: ''
  };
};

export const ORDER_STEPS = [
  { key: 'pending', step: 1, title: 'Chọn Hàng & Gửi Link', shortLabel: 'Chờ cọc', stepIndex: 0 },
  { key: 'deposit_paid', step: 2, title: 'Cọc Đơn Hàng 100%', shortLabel: 'Đã cọc', stepIndex: 1 },
  { key: 'confirmed', step: 3, title: 'TAVY Xác Nhận Đơn', shortLabel: 'Đã duyệt', stepIndex: 2 },
  { key: 'purchased', step: 4, title: 'TAVY Mua Hàng (Video POV)', shortLabel: 'Mua hàng', stepIndex: 3, hasPovVideo: true },
  { key: 'packed_kr', step: 5, title: 'TAVY Đóng Hàng (Video Kiện)', shortLabel: 'Đóng kiện', stepIndex: 4, hasPackingVideo: true },
  { key: 'in_transit_air', step: 6, title: 'Bay Air Hàn - Việt', shortLabel: 'Bay Air', stepIndex: 5 },
  { key: 'customs_cleared', step: 7, title: 'Thông Quan & Kho VN', shortLabel: 'Kho VN', stepIndex: 6 },
  { key: 'completed', step: 8, title: 'Giao Hàng & Hoàn Tất', shortLabel: 'Đã giao', stepIndex: 7 }
];

export const getOrderStepIndex = (orderObj) => {
  if (!orderObj) return 0;
  const statusKey = typeof orderObj === 'string' ? orderObj : orderObj.status;
  const config = getStatusConfig(statusKey);
  if (config && typeof config.stepIndex === 'number' && config.stepIndex >= 0) {
    return config.stepIndex;
  }
  const isPaid = typeof orderObj === 'object' && (orderObj?.paymentStatus === 'paid' || orderObj?.paidAmountVnd > 0);
  return isPaid ? 1 : 0;
};
