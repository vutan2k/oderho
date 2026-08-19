/**
 * Centralized Order Status Definitions & Visual Tokens for TAVY KOREA
 */

export const ORDER_STATUSES = {
  pending: {
    id: 'pending',
    label: 'Chờ cọc',
    shortLabel: 'Chờ cọc',
    color: '#D97706',
    bgColor: '#FEF3C7',
    borderColor: '#F59E0B',
    stepIndex: 0
  },
  deposit_paid: {
    id: 'deposit_paid',
    label: 'Đã cọc 100%',
    shortLabel: 'Đã cọc 100%',
    color: '#4F46E5',
    bgColor: '#EEF2FF',
    borderColor: '#6366F1',
    stepIndex: 1
  },
  purchased: {
    id: 'purchased',
    label: 'Đang mua hộ (Hàn Quốc)',
    shortLabel: 'Đang mua hộ',
    color: '#7C3AED',
    bgColor: '#F3E8FF',
    borderColor: '#8B5CF6',
    stepIndex: 2
  },
  in_kr_warehouse: {
    id: 'in_kr_warehouse',
    label: 'Đã về kho Seoul (Hàn Quốc)',
    shortLabel: 'Kho Seoul',
    color: '#DB2777',
    bgColor: '#FCE7F3',
    borderColor: '#EC4899',
    stepIndex: 3
  },
  transit: {
    id: 'transit',
    label: 'Shipping (Bay Air Hàn - Việt)',
    shortLabel: 'Shipping',
    color: '#0891B2',
    bgColor: '#CFFAFE',
    borderColor: '#06B6D4',
    stepIndex: 4
  },
  in_vn_warehouse: {
    id: 'in_vn_warehouse',
    label: 'Đã thông quan & về kho Việt Nam',
    shortLabel: 'Kho VN',
    color: '#0D9488',
    bgColor: '#CCFBF1',
    borderColor: '#14B8A6',
    stepIndex: 5
  },
  delivering: {
    id: 'delivering',
    label: 'Đang giao hàng tận nơi',
    shortLabel: 'Đang giao',
    color: '#EA580C',
    bgColor: '#FFEDD5',
    borderColor: '#F97316',
    stepIndex: 6
  },
  completed: {
    id: 'completed',
    label: 'Giao hàng thành công & Tất toán',
    shortLabel: 'Đã giao',
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
    label: statusKey || 'Chờ cọc',
    shortLabel: statusKey || 'Chờ cọc',
    color: '#4B5563',
    bgColor: '#F3F4F6',
    borderColor: '#9CA3AF',
    stepIndex: 0
  };
};

export const ORDER_STEPS = [
  { key: 'pending', title: 'Chờ cọc', stepIndex: 0 },
  { key: 'deposit_paid', title: 'Đã cọc 100%', stepIndex: 1 },
  { key: 'purchased', title: 'Đang mua hộ', stepIndex: 2 },
  { key: 'in_kr_warehouse', title: 'Kho Seoul', stepIndex: 3 },
  { key: 'transit', title: 'Shipping Air', stepIndex: 4 },
  { key: 'in_vn_warehouse', title: 'Kho VN', stepIndex: 5 },
  { key: 'delivering', title: 'Đang giao', stepIndex: 6 },
  { key: 'completed', title: 'Đã giao', stepIndex: 7 }
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
