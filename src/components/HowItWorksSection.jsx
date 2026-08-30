import React from 'react';
import {
  Search,
  CreditCard,
  CheckCircle2,
  Video,
  PackageCheck,
  Plane,
  ShieldCheck,
  Package,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ORDER_WORKFLOW_STEPS = [
  {
    step: 1,
    title: 'Chọn Hàng & Gửi Link',
    desc: 'Quý khách chọn sản phẩm trên web TAVY hoặc gửi link từ Olive Young, KGC, Nonghyup, hiệu thuốc Hàn Quốc.',
    icon: Search,
    badge: 'Bước 1'
  },
  {
    step: 2,
    title: 'Cọc Đơn Hàng 100%',
    desc: 'Thanh toán cọc 100% trọn gói giá về tay nhanh chóng qua VietQR tự động (MBBank) hoặc Woori Bank (KRW).',
    icon: CreditCard,
    badge: 'Bước 2'
  },
  {
    step: 3,
    title: 'TAVY Xác Nhận Đơn',
    desc: 'Hệ thống tự động ghi nhận thanh toán, admin kiểm tra thông tin phân loại sản phẩm và lên lịch gom hàng tại Hàn.',
    icon: CheckCircle2,
    badge: 'Bước 3'
  },
  {
    step: 4,
    title: 'TAVY Mua Hàng (Video POV)',
    desc: 'Nhân viên TAVY trực tiếp đến Store Olive Young / mua Online tại Hàn Quốc. Quay video POV thực tế gửi khách xem.',
    icon: Video,
    badge: 'Có Video POV',
    highlight: true
  },
  {
    step: 5,
    title: 'TAVY Đóng Hàng (Video Đóng Kiện)',
    desc: 'Kiểm tra seal, hạn sử dụng, bọc chống sốc 3 lớp cẩn thận và quay video đóng thùng hàng gửi khách xác nhận.',
    icon: PackageCheck,
    badge: 'Có Video Đóng Gói',
    highlight: true
  },
  {
    step: 6,
    title: 'Gửi Hàng Bay Về Việt Nam',
    desc: 'Hàng được vận chuyển bằng đường bay chuyên tuyến Incheon ✈️ Hà Nội / TP.HCM trong 3-7 ngày làm việc.',
    icon: Plane,
    badge: 'Bước 6'
  },
  {
    step: 7,
    title: 'Thông Quan Hải Quan',
    desc: 'Khai báo thủ tục hải quan chính ngạch, đảm bảo hàng hóa đầy đủ chứng từ nguồn gốc xuất xứ và an toàn.',
    icon: ShieldCheck,
    badge: 'Bước 7'
  },
  {
    step: 8,
    title: 'Giao Hàng & Hoàn Tất',
    desc: 'Giao hàng tận nơi qua đơn vị vận chuyển nội địa. Quý khách đồng kiểm kiện hàng nguyên vẹn và hoàn tất đơn hàng.',
    icon: Package,
    badge: 'Bước 8'
  }
];

export default function HowItWorksSection() {
  return (
    <section style={{ padding: '60px 0', backgroundColor: '#FAF9F6', borderTop: '1px solid #EAE6DF', borderBottom: '1px solid #EAE6DF' }}>
      <div className="container">

        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px auto' }}>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            letterSpacing: '1.5px',
            color: 'var(--purple-primary)',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '8px'
          }}>
            QUY TRÌNH MUA HỘ MINH BẠCH
          </span>

          <h2 style={{ fontSize: '2.1rem', fontFamily: 'var(--font-serif)', fontWeight: 700, color: '#1A1A2E', margin: '0 0 12px 0' }}>
            Quy Trình 8 Bước Đặt Hàng & Vận Chuyển
          </h2>

          <p style={{ fontSize: '0.95rem', color: '#555555', lineHeight: 1.6, margin: 0 }}>
            Tất cả đơn hàng đều có <strong>Video POV mua tại Store Hàn Quốc</strong> và <strong>Video đóng gói kiện hàng</strong> giúp quý khách theo dõi minh bạch 100%.
          </p>
        </div>

        {/* 8 Steps Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
        }}>
          {ORDER_WORKFLOW_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                style={{
                  background: 'var(--bg-white, #FFFFFF)',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  border: step.highlight ? '1.5px solid var(--workflow-highlight-border, #D8B4FE)' : '1px solid var(--border-color, #E8E5DF)',
                  boxShadow: step.highlight ? '0 4px 16px rgba(126, 34, 206, 0.08)' : '0 2px 10px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Header Card */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: step.highlight ? 'var(--workflow-highlight-icon-bg, #7E22CE)' : 'var(--bg-subtle-purple, #F4F4F6)',
                    color: step.highlight ? 'var(--workflow-highlight-icon-color, #FFFFFF)' : 'var(--text-muted, #4B5563)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={20} />
                  </div>

                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: step.highlight ? 'var(--workflow-highlight-badge-bg, #7E22CE)' : 'var(--bg-subtle-purple, #F3F4F6)',
                    color: step.highlight ? 'var(--workflow-highlight-badge-color, #FFFFFF)' : 'var(--text-muted, #6B7280)',
                    border: step.highlight ? '1px solid var(--workflow-highlight-border, transparent)' : 'none'
                  }}>
                    {step.badge}
                  </span>
                </div>

                {/* Step Title */}
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark, #1F2937)', marginBottom: '6px', lineHeight: 1.4 }}>
                  <span style={{ color: step.highlight ? 'var(--workflow-highlight-accent, #7E22CE)' : 'var(--text-dark)', marginRight: '6px' }}>#{step.step}</span>
                  {step.title}
                </h3>

                {/* Step Description */}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #6B7280)', lineHeight: 1.5, margin: 0, flex: 1 }}>
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Action Link to Full Policy */}
        <div style={{ textAlign: 'center', marginTop: '36px' }}>
          <Link
            to="/policy"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--purple-primary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              textDecoration: 'none',
              padding: '10px 24px',
              borderRadius: '24px',
              border: '1px solid var(--purple-primary)',
              backgroundColor: '#FFFFFF',
            }}
          >
            <span>Xem chi tiết Chính sách & Quy định bảo hành</span>
            <ArrowRight size={15} />
          </Link>
        </div>

      </div>
    </section>
  );
}
