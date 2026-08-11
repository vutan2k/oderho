import React from 'react';
import { ShieldCheck, Globe, QrCode, Award } from 'lucide-react';

export default function WhyChooseUs() {
  const features = [
    { icon: <ShieldCheck size={24} />, title: 'Cam Kết Chính Hãng', desc: 'Mua trực tiếp từ Olive Young, hiệu thuốc & Store Hàn.' },
    { icon: <Globe size={24} />, title: 'Vận Chuyển Hàng Không', desc: 'Bay Air từ Seoul về VN chỉ từ 3-5 ngày làm việc.' },
    { icon: <QrCode size={24} />, title: 'Thanh Toán Dễ Dàng', desc: 'Chuyển khoản VietQR Việt Nam hoặc Ngân hàng Hàn Quốc.' },
    { icon: <Award size={24} />, title: 'Hỗ Trợ 24/7', desc: 'Tư vấn nhiệt tình cho cộng đồng người Việt.' }
  ];

  return (
    <section style={{
      background: 'var(--bg-white)',
      padding: '35px 0',
      borderBottom: '1px solid var(--border-color)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px'
        }}>
          {features.map((feat, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--purple-primary)', flexShrink: 0, marginTop: '2px' }}>
                {feat.icon}
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '4px' }}>
                  {feat.title}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
