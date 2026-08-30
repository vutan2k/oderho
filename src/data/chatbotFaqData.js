/**
 * Centralized ChatBot Knowledge Base & Quick Replies for TAVY KOREA
 * Supports 8-step transparency workflow, Won exchange rates, refund policy, and bank payment data.
 */

export const CHATBOT_QUICK_ACTIONS = [
  {
    id: 'lookup_order',
    label: 'Tra cứu đơn hàng',
    shortLabel: 'Tra cứu đơn',
    icon: 'PackageSearch',
    color: '#00CC00',
    bgColor: '#F0FDF4',
    actionType: 'view',
    view: 'lookup_order'
  },
  {
    id: 'consult_product',
    label: 'Mỹ phẩm Olive Young',
    shortLabel: 'Mỹ phẩm Hàn',
    icon: 'Sparkles',
    color: '#D97706',
    bgColor: '#FFFBEB',
    actionType: 'view',
    view: 'consult_product'
  },
  {
    id: 'faq_workflow',
    label: 'Quy trình 8 bước',
    shortLabel: '8 Bước POV',
    icon: 'Plane',
    color: '#0284C7',
    bgColor: '#F0F9FF',
    actionType: 'reply',
    replyKey: 'workflow_8steps'
  },
  {
    id: 'faq_refund',
    label: 'Đổi trả & Đền bù 100%',
    shortLabel: 'Đền bù 100%',
    icon: 'ShieldCheck',
    color: '#16A34A',
    bgColor: '#F0FDF4',
    actionType: 'reply',
    replyKey: 'refund_guarantee'
  },
  {
    id: 'faq_payment',
    label: 'Thanh toán VietQR & KRW',
    shortLabel: 'STK Chuyển khoản',
    icon: 'CreditCard',
    color: '#00AA00',
    bgColor: '#F0FDF4',
    actionType: 'reply',
    replyKey: 'payment_info'
  },
  {
    id: 'open_facebook',
    label: 'Chat Facebook CSKH',
    shortLabel: 'Facebook 24/7',
    icon: 'MessageCircle',
    color: '#0084FF',
    bgColor: '#F0F7FF',
    actionType: 'tab',
    tab: 'facebook'
  }
];

export const CHATBOT_REPLIES = {
  welcome: {
    title: 'Xin chào! TAVY Korea có thể hỗ trợ gì cho bạn?',
    text: 'Tất cả đơn hàng tại TAVY đều được mua trực tiếp tại Store Olive Young / Hiệu thuốc Hàn Quốc và có Video POV mua hàng + Video đóng kiện cân ký minh bạch 100%.',
    suggestedActions: ['lookup_order', 'consult_product', 'faq_workflow', 'faq_refund', 'faq_payment', 'open_facebook']
  },

  workflow_8steps: {
    title: '🛡️ Quy trình 8 bước mua hàng minh bạch tại TAVY Korea:',
    text: `1. Khách chọn hàng hoặc gửi link Olive Young / Musinsa.
2. Khách cọc 100% tiền hàng qua VietQR hoặc Woori Bank.
3. TAVY duyệt đơn & lên lịch mua tại Hàn.
4. Mua hàng tại Store Hàn (Có Video POV + Hóa đơn).
5. Đóng kiện tại kho Seoul (Bọc 3 lớp + Cân ký + Video).
6. Bay Air Incheon ✈️ VN trong 3-7 ngày làm việc (Có mã AWB).
7. Thông quan hải quan và chuyển về kho nội địa.
8. Giao hàng tận tay khách hàng & hoàn tất.`,
    suggestedActions: ['lookup_order', 'faq_refund', 'open_facebook']
  },

  pricing_rate: {
    title: '💵 Cách tính giá về tay & Tỷ giá Won:',
    text: `• Công thức: Giá về tay = (Giá Won x Tỷ giá KRW) + Phí dịch vụ (nếu có) + Cước vận chuyển.
• Tỷ giá tham khảo: 19.0 - 20.0 VNĐ / Won (cập nhật realtime theo biến động thị trường).
• Cước bay Air Hàn - Việt: Siêu tốc 3-7 ngày làm việc.`,
    suggestedActions: ['consult_product', 'faq_payment', 'open_facebook']
  },

  refund_guarantee: {
    title: '🔄 Chính sách Đổi trả & Đền bù 100%:',
    text: `• Cam kết bồi thường GẤP 10 LẦN nếu phát hiện hàng giả/nhái.
• ĐỀN BÙ 100% hoặc đổi mới nếu hàng bị thất lạc, vỡ bể do vận chuyển.
• HOÀN CỌC 100% trong 24 giờ nếu Store Hàn báo hết hàng hoặc không mua được.`,
    suggestedActions: ['faq_workflow', 'faq_payment', 'open_facebook']
  },

  payment_info: {
    title: '💳 Thông tin Chuyển khoản & Đặt cọc:',
    text: `1. VietQR (VND - Tự động duyệt):
• Ngân hàng: MBBank (Quân Đội)
• Số tài khoản: 1330042000
• Chủ tài khoản: LE THI HA VY
• Nội dung: TAVY [Số điện thoại] (VD: TAVY 0912345678)

2. Chuyển khoản Hàn Quốc (KRW):
• Ngân hàng: Woori Bank (우리은행)
• Số tài khoản: 1002959863658
• Chủ tài khoản: VU VAN TAN`,
    suggestedActions: ['lookup_order', 'open_facebook']
  }
};
