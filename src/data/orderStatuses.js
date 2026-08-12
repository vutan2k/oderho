/**
 * Centralized Order Status Definitions & Visual Tokens for TAVY KOREA
 */

export const ORDER_STATUSES = {
  pending: {
    id: 'pending',
    label: 'Đã đặt hàng (Chờ báo giá)',
    shortLabel: 'Đã đặt hàng',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    borderColor: '#60A5FA',
    stepIndex: 0
  },
  deposit_paid: {
    id: 'deposit_paid',
    label: 'Đã cọc (70% hoặc 100% tổng build)',
    shortLabel: 'Đã cọc',
    color: '#D97706',
    bgColor: '#FEF3C7',
    borderColor: '#F59E0B',
    stepIndex: 1
  },
  accepted: {
    id: 'accepted',
    label: 'Chấp nhận đơn',
    shortLabel: 'Chấp nhận đơn',
    color: '#4F46E5',
    bgColor: '#EEF2FF',
    borderColor: '#6366F1',
    stepIndex: 2
  },
  purchasing: {
    id: 'purchasing',
    label: 'Mua hộ và đóng gói',
    shortLabel: 'Mua hộ & Đóng gói',
    color: '#7C3AED',
    bgColor: '#F3E8FF',
    borderColor: '#8B5CF6',
    stepIndex: 3
  },
  customs_kr: {
    id: 'customs_kr',
    label: 'Thông quan Korea',
    shortLabel: 'Thông quan KR',
    color: '#DB2777',
    bgColor: '#FCE7F3',
    borderColor: '#EC4899',
    stepIndex: 4
  },
  customs_vn: {
    id: 'customs_vn',
    label: 'Thông quan Việt Nam',
    shortLabel: 'Thông quan VN',
    color: '#0891B2',
    bgColor: '#CFFAFE',
    borderColor: '#06B6D4',
    stepIndex: 5
  },
  delivering: {
    id: 'delivering',
    label: 'Giao hàng đến khách',
    shortLabel: 'Giao hàng',
    color: '#EA580C',
    bgColor: '#FFEDD5',
    borderColor: '#F97316',
    stepIndex: 6
  },
  completed: {
    id: 'completed',
    label: 'Hoàn thành',
    shortLabel: 'Hoàn thành',
    color: '#059669',
    bgColor: '#D1FAE5',
    borderColor: '#10B981',
    stepIndex: 7
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
    label: statusKey || 'Đã đặt hàng',
    shortLabel: statusKey || 'Đã đặt hàng',
    color: '#4B5563',
    bgColor: '#F3F4F6',
    borderColor: '#9CA3AF',
    stepIndex: 0
  };
};
