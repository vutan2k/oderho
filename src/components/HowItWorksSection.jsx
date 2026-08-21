import React from 'react';
import {
  Search,
  CreditCard,
  CheckCircle2,
  Video,
  PackageCheck,
  Plane,
  ShieldCheck,
  Gift,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ORDER_WORKFLOW_STEPS = [
  {
    step: 1,
    title: 'Chọn Hàng & Gửi Link',
    desc: 'Quý khách chọn sản phẩm trực tiếp trên web TAVY hoặc gửi link sản phẩm từ Olive Young, Musinsa, hiệu thuốc Hàn Quốc.',
    icon: Search,
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    badge: 'Bước khởi đầu'
  },
  {
    step: 2,
    title: 'Cọc Đơn Hàng',
    desc: 'Thanh toán cọc 100% tiền hàng nhanh chóng, an toàn qua VietQR tự động (MBBank) hoặc Woori Bank (KRW).',
    icon: CreditCard,
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    badge: 'Tự động 24/7'
  },
  {
    step: 3,
    title: 'TAVY Xác Nhận Đơn',
    desc: 'Hệ thống tự động ghi nhận thanh toán, admin kiểm tra thông tin phân loại sản phẩm và lên lịch mua hàng tại Hàn Quốc.',
    icon: CheckCircle2,
    color: '#10B981',
    bgColor: '#ECFDF5',
    badge: 'Duyệt trong 15p'
  },
  {
    step: 4,
    title: 'TAVY Mua Hàng Tại Hàn (Video POV)',
    desc: 'Nhân viên TAVY trực tiếp đến Store Olive Young / mua Online tại Hàn Quốc. Quay video POV thực tế gửi khách xem.',
    icon: Video,
    color: '#EC4899',
    bgColor: '#FDF2F8',
    badge: '🌟 Có Video POV tại Store',
    highlight: true
  },
  {
    step: 5,
    title: 'TAVY Đóng Hàng (Video Đóng Kiện)',
    desc: 'Kiểm tra seal, hạn sử dụng, bọc chống sốc 3 lớp cẩn thận và quay video đóng thùng hàng gửi khách xác nhận.',
    icon: PackageCheck,
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    badge: '🌟 Có Video Đóng Hàng',
    highlight: true
  },
  {
    step: 6,
    title: 'Gửi Hàng Bay Về Việt Nam',
    desc: 'Hàng được vận chuyển bằng đường hàng không quốc tế chuyên tuyến Incheon (ICN) ✈️ Nội Bài / Tân Sơn Nhất (3-5 ngày).',
    icon: Plane,
    color: '#06B6D4',
    bgColor: '#ECFEFF',
    badge: 'Bay nhanh 3-5 ngày'
  },
  {
    step: 7,
    title: 'Thông Quan Hải Quan Việt Nam',
    desc: 'Khai báo thủ tục hải quan chính ngạch, đảm bảo hàng hóa đầy đủ chứng từ nguồn gốc xuất xứ và an toàn pháp lý.',
    icon: ShieldCheck,
    color: '#6366F1',
    bgColor: '#EEF2FF',
    badge: 'Chính ngạch 100%'
  },
  {
    step: 8,
    title: 'Ship Tới Khách & Hoàn Tất',
    desc: 'Giao hàng tận nơi qua đơn vị chuyển phát nhanh. Quý khách kiểm tra kiện hàng, thanh toán cước vận chuyển và hoàn tất.',
    icon: Gift,
    color: '#10B981',
    bgColor: '#F0FDF4',
    badge: 'Giao tận tay'
  }
];

export default function HowItWorksSection() {
  return (
    <section style={{ padding: '80px 0', backgroundColor: '#FFFFFF', position: 'relative' }}>
      <div className="container">

        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 50px auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#FAF5FF',
            border: '1px solid #E9D5FF',
            padding: '6px 16px',
            borderRadius: '30px',
            fontSize: '0.82rem',
            fontWeight: 800,
            color: 'var(--purple-primary)',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            marginBottom: '12px'
          }}>
            <Sparkles size={16} />
            <span>MINH BẠCH & KHÁCH QUAN 100%</span>
          </div>

          <h2 style={{ fontSize: '2.3rem', fontFamily: 'var(--font-serif)', fontWeight: 800, color: '#1E1B4B', margin: '0 0 16px 0', letterSpacing: '-0.5px' }}>
            Quy Trình Mua Hàng & Vận Chuyển Hàn - Việt
          </h2>

          <p style={{ fontSize: '1rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
            TAVY Korea mang đến trải nghiệm mua hàng hộ minh bạch số 1 thị trường với <strong>Video POV mua hàng trực tiếp tại Store Hàn Quốc</strong> và <strong>Video quy trình đóng gói từng kiện hàng</strong>.
          </p>
        </div>

        {/* 8 Steps Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
          position: 'relative'
        }}>
          {ORDER_WORKFLOW_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                style={{
                  background: step.highlight ? '#FAF5FF' : '#FFFFFF',
                  borderRadius: '20px',
                  padding: '28px 24px',
                  border: step.highlight ? '2px solid var(--purple-primary)' : '1px solid #E2E8F0',
                  boxShadow: step.highlight ? '0 10px 30px rgba(124, 58, 237, 0.08)' : '0 4px 16px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                }}
              >
                {/* Step Number Top Left */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    backgroundColor: step.bgColor,
                    color: step.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '1.1rem'
                  }}>
                    <Icon size={22} />
                  </div>

                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    backgroundColor: step.highlight ? 'var(--purple-primary)' : '#F1F5F9',
                    color: step.highlight ? '#FFFFFF' : '#475569'
                  }}>
                    {step.badge}
                  </span>
                </div>

                {/* Step Title */}
                <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px', lineHeight: 1.4 }}>
                  <span style={{ color: step.color, marginRight: '6px' }}>#{step.step}</span>
                  {step.title}
                </h3>

                {/* Step Description */}
                <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6, margin: 0, flex: 1 }}>
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Action Link to Full Policy */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link
            to="/policy"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--purple-primary)',
              fontWeight: 800,
              fontSize: '0.95rem',
              textDecoration: 'none',
              padding: '12px 28px',
              borderRadius: '30px',
              border: '2px solid var(--purple-primary)',
              transition: 'all 0.2s ease'
            }}
          >
            <span>Xem chi tiết Chính sách bảo hành, đổi trả & cước phí</span>
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}
