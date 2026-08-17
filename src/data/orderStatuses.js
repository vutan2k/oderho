/**
 * Centralized Order Status Definitions & Visual Tokens for TAVY KOREA
 */

export const ORDER_STATUSES = {
  pending: {
    id: 'pending',
    label: 'Chờ báo giá / Chờ cọc',
    shortLabel: 'Chờ cọc',
    color: '#D97706',
    bgColor: '#FEF3C7',
    borderColor: '#F59E0B',
    stepIndex: 0
  },
  quoted: {
    id: 'quoted',
    label: 'Đã báo giá (Chờ duyệt)',
    shortLabel: 'Đã báo giá',
    color: '#2563EB',
    bgColor: '#DBEAFE',
    borderColor: '#3B82F6',
    stepIndex: 1
  },
  deposit_paid: {
    id: 'deposit_paid',
    label: 'Đã cọc 50%',
    shortLabel: 'Đã cọc',
    color: '#4F46E5',
    bgColor: '#EEF2FF',
    borderColor: '#6366F1',
    stepIndex: 2
  },
  purchased: {
    id: 'purchased',
    label: 'Đã mua tại Hàn Quốc',
    shortLabel: 'Đã mua Hàn',
    color: '#7C3AED',
    bgColor: '#F3E8FF',
    borderColor: '#8B5CF6',
    stepIndex: 3
  },
  in_kr_warehouse: {
    id: 'in_kr_warehouse',
    label: 'Đã về kho Seoul (Hàn Quốc)',
    shortLabel: 'Kho Seoul',
    color: '#DB2777',
    bgColor: '#FCE7F3',
    borderColor: '#EC4899',
    stepIndex: 4
  },
  transit: {
    id: 'transit',
    label: 'Đang bay về Việt Nam (Air Cargo)',
    shortLabel: 'Đang về VN',
    color: '#0891B2',
    bgColor: '#CFFAFE',
    borderColor: '#06B6D4',
    stepIndex: 5
  },
  in_vn_warehouse: {
    id: 'in_vn_warehouse',
    label: 'Đã thông quan & về kho Việt Nam',
    shortLabel: 'Kho VN',
    color: '#0D9488',
    bgColor: '#CCFBF1',
    borderColor: '#14B8A6',
    stepIndex: 6
  },
  delivering: {
    id: 'delivering',
    label: 'Đang giao hàng tận nơi',
    shortLabel: 'Đang giao',
    color: '#EA580C',
    bgColor: '#FFEDD5',
    borderColor: '#F97316',
    stepIndex: 7
  },
  completed: {
    id: 'completed',
    label: 'Giao hàng thành công & Tất toán',
    shortLabel: 'Đã giao',
    color: '#059669',
    bgColor: '#D1FAE5',
    borderColor: '#10B981',
    stepIndex: 8
  },
  cancelled: {
    id: 'cancelled',
    label: 'Đã hủy đơn hàng',
    shortLabel: 'Đã hủy',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    borderColor: '#EF4444',
    stepIndex: -1
  }
};

export const getStatusConfig = (statusKey) => {
  return ORDER_STATUSES[statusKey] || {
    id: statusKey || 'pending',
    label: statusKey || 'Chờ cọc',
    shortLabel: statusKey || 'Chờ cọc',
    color: '#4B5563',
    bgColor: '#F3F4F6',
    borderColor: '#9CA3AF',
    stepIndex: 0
  };
};
