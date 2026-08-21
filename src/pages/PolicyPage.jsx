import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, RotateCcw, CreditCard, ShieldCheck, Clock, CheckCircle2, AlertCircle, HelpCircle, Truck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

export default function PolicyPage() {
  const [activeTab, setActiveTab] = useState('order'); // 'order' | 'refund' | 'payment'

  const tabs = [
    { id: 'order', label: '1. Quy định mua hàng', icon: ShoppingBag },
    { id: 'refund', label: '2. Chính sách đổi trả & Hoàn tiền', icon: RotateCcw },
    { id: 'payment', label: '3. Hướng dẫn thanh toán', icon: CreditCard },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FAF8F5' }}>
      <Helmet>
        <title>Chính sách & Quy định mua hàng - TAVY KOREA</title>
        <meta name="description" content="Quy định mua hàng hộ Hàn Quốc, chính sách đổi trả, hoàn tiền và hướng dẫn thanh toán chi tiết tại TAVY Korea." />
      </Helmet>

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
        color: '#FFFFFF',
        padding: '50px 20px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.12)',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '16px',
            letterSpacing: '1px'
          }}>
            <ShieldCheck size={16} color="#FBBF24" />
            <span>CAM KẾT MINH BẠCH & UY TÍN 100%</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>
            Chính Sách & Quy Định Dịch Vụ
          </h1>
          <p style={{ fontSize: '1rem', color: '#E0E7FF', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto' }}>
            Thông tin chi tiết về quy trình đặt hàng Olive Young, bảng giá vận chuyển, chính sách bảo hiểm hàng hóa và hình thức thanh toán tại TAVY Korea.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ maxWidth: '1000px', margin: '-24px auto 60px', width: '100%', padding: '0 20px', flex: 1, zIndex: 10 }}>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '8px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
          gap: '8px',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: '1 1 220px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  transition: 'all 0.25s ease',
                  backgroundColor: isActive ? 'var(--purple-primary)' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#4B5563',
                  boxShadow: isActive ? '0 4px 14px rgba(124, 58, 237, 0.25)' : 'none',
                }}
              >
                <Icon size={18} color={isActive ? '#FFFFFF' : 'var(--purple-primary)'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Quy định mua hàng */}
        {activeTab === 'order' && (
          <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '36px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShoppingBag size={24} color="var(--purple-primary)" />
              Quy Trình & Quy Định Đặt Mua Hàng Hộ
            </h2>

            <div style={{ display: 'grid', gap: '20px', color: '#374151', lineHeight: '1.7', fontSize: '0.95rem' }}>
              <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', borderLeft: '4px solid var(--purple-primary)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>1. Phạm vi nhận mua hộ</h3>
                <p>
                  TAVY Korea nhận order tất cả các sản phẩm mỹ phẩm dưỡng da, trang điểm, thực phẩm chức năng, hồng sâm, collagen, thuốc và thiết bị làm đẹp nội địa Hàn Quốc từ các hệ thống uy tín: <strong>Olive Young, Musinsa, Kakao Gift, Coupang, các hiệu thuốc và trung tâm thương mại tại Seoul</strong>.
                </p>
              </div>

              <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #3B82F6' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>2. Quy định về giá bán & Tỷ giá</h3>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  <li><strong>Giá sản phẩm:</strong> Tính theo giá thực tế trên website Hàn Quốc (ưu tiên giá sale tại thời điểm đặt cọc).</li>
                  <li><strong>Tỷ giá Won (KRW):</strong> Tỷ giá được niêm yết công khai và cập nhật minh bạch theo hệ thống (thường dao động 19.0 - 20.0đ/Won).</li>
                  <li><strong>Công thức tính trọn gói:</strong> <code>Giá về tay (VND) = [Giá Won x Tỷ giá] + Phí mua hộ (0-5%) + Cước vận chuyển Hàn - Việt</code>.</li>
                </ul>
              </div>

              <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #10B981' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>3. Thời gian giao hàng (Hàn Quốc ✈️ Việt Nam)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '10px' }}>
                  <div style={{ background: '#FFF', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>✈️ Bay nhanh (Đường bay):</div>
                    <div style={{ color: '#059669', fontWeight: 800 }}>3 - 5 ngày làm việc</div>
                  </div>
                  <div style={{ background: '#FFF', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>🚢 Đường biển (Hàng nặng/cồng kềnh):</div>
                    <div style={{ color: '#2563EB', fontWeight: 800 }}>10 - 15 ngày làm việc</div>
                  </div>
                </div>
              </div>

              <div style={{ background: '#FFFBEB', padding: '20px', borderRadius: '12px', border: '1px solid #FDE68A' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#B45309', marginBottom: '6px' }}>
                  <AlertCircle size={18} /> Lưu ý quan trọng:
                </div>
                <p style={{ margin: 0, color: '#92400E' }}>
                  Sau khi đơn hàng đã được TAVY tiến hành mua tại cửa hàng Hàn Quốc, quý khách sẽ không thể thay đổi thông tin sản phẩm hoặc hủy đơn do chính sách không hoàn hủy của các hệ thống bán lẻ tại Hàn Quốc.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Chính sách đổi trả & Hoàn tiền */}
        {activeTab === 'refund' && (
          <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '36px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <RotateCcw size={24} color="#EF4444" />
              Chính Sách Đổi Trả, Đền Bù & Hoàn Tiền
            </h2>

            <div style={{ display: 'grid', gap: '20px', color: '#374151', lineHeight: '1.7', fontSize: '0.95rem' }}>

              <div style={{ background: '#ECFDF5', padding: '20px', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#065F46', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} color="#059669" /> Trường hợp được ĐỀN BÙ 100% hoặc HOÀN TIỀN
                </h3>
                <ul style={{ paddingLeft: '20px', margin: 0, color: '#047857' }}>
                  <li>Sản phẩm bị phát hiện là <strong>hàng không chính hãng</strong> (Cam kết đền gấp 10 lần giá trị).</li>
                  <li>Hàng bị <strong>thất lạc, mất mát</strong> trong quá trình vận chuyển từ Hàn Quốc về Việt Nam.</li>
                  <li>Sản phẩm bị <strong>vỡ, bể, hư hỏng nặng</strong> do quá trình vận chuyển (Quý khách vui lòng quay video khi mở hộp hàng).</li>
                  <li>TAVY mua <strong>sai màu sắc, sai phân loại hoặc sai dung tích</strong> so với đơn đặt hàng đã xác nhận.</li>
                  <li>Shop tại Hàn Quốc <strong>báo hết hàng hoặc hủy đơn</strong>: TAVY hoàn lại 100% tiền cọc trong vòng 24 giờ làm việc.</li>
                </ul>
              </div>

              <div style={{ background: '#FEF2F2', padding: '20px', borderRadius: '12px', border: '1px solid #FECACA' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#991B1B', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={18} color="#DC2626" /> Trường hợp KHÔNG hỗ trợ đổi trả
                </h3>
                <ul style={{ paddingLeft: '20px', margin: 0, color: '#B91C1C' }}>
                  <li>Khách hàng tự đổi ý hoặc không ưng ý sản phẩm sau khi hàng đã mua tại Hàn.</li>
                  <li>Hộp ngoài sản phẩm bị móp nhẹ trong quá trình vận chuyển quốc tế nhưng <strong>chất lượng bên trong nguyên vẹn</strong>.</li>
                  <li>Sản phẩm đã bị bóc seal, mở nắp hoặc qua sử dụng sau khi nhận tại Việt Nam.</li>
                  <li>Quý khách không cung cấp được video đồng kiểm khi mở kiện hàng.</li>
                </ul>
              </div>

              <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #8B5CF6' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>Thời gian & Phương thức hoàn tiền</h3>
                <p style={{ margin: 0 }}>
                  Tiền hoàn sẽ được chuyển trực tiếp về tài khoản ngân hàng của quý khách trong vòng <strong>24h - 48h</strong> kể từ khi nhận được xác nhận bồi hoàn từ bộ phận chăm sóc khách hàng TAVY.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* Tab 3: Hướng dẫn thanh toán */}
        {activeTab === 'payment' && (
          <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '36px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CreditCard size={24} color="var(--purple-primary)" />
              Hướng Dẫn Thanh Toán & Đặt Cọc
            </h2>

            <div style={{ display: 'grid', gap: '24px', color: '#374151', lineHeight: '1.7', fontSize: '0.95rem' }}>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>

                {/* Phương thức 1: VietQR */}
                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '20px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '1.4rem' }}>🇻🇳</span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E40AF', margin: 0 }}>Chuyển khoản VND (VietQR)</h3>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#1E3A8A', marginBottom: '12px' }}>
                    Hệ thống tạo mã VietQR tự động điền sẵn số tiền và mã đơn hàng, tích hợp xác nhận giao dịch qua cổng PayOS.
                  </p>
                  <div style={{ background: '#FFF', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <div><strong>Ngân hàng:</strong> MBBank (Quân Đội)</div>
                    <div><strong>Số tài khoản:</strong> 34966778899</div>
                    <div><strong>Chủ TK:</strong> VU VAN TAN</div>
                    <div><strong>Nội dung:</strong> Mã đơn hàng (VD: ORD-123456)</div>
                  </div>
                </div>

                {/* Phương thức 2: Woori Bank */}
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '20px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '1.4rem' }}>🇰🇷</span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#166534', margin: 0 }}>Chuyển khoản KRW (Woori Bank)</h3>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#14532D', marginBottom: '12px' }}>
                    Dành cho khách hàng đang sinh sống/làm việc tại Hàn Quốc chuyển khoản trực tiếp qua ngân hàng Hàn.
                  </p>
                  <div style={{ background: '#FFF', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <div><strong>Ngân hàng:</strong> Woori Bank (우리은행)</div>
                    <div><strong>Số tài khoản:</strong> 1002959863658</div>
                    <div><strong>Chủ TK:</strong> VU VAN TAN</div>
                    <div><strong>Nội dung:</strong> Mã đơn hàng</div>
                  </div>
                </div>

              </div>

              {/* Quy trình đặt cọc 2 bước */}
              <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '16px' }}>
                  ⏱️ Quy định đặt cọc đơn hàng:
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div style={{ background: '#FFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ color: 'var(--purple-primary)', fontWeight: 800, fontSize: '0.9rem', marginBottom: '4px' }}>BƯỚC 1: ĐẶT CỌC (100% TIỀN HÀNG)</div>
                    <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
                      Để TAVY tiến hành xuất kho và thanh toán với nhà cung cấp tại Hàn Quốc.
                    </p>
                  </div>
                  <div style={{ background: '#FFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ color: '#059669', fontWeight: 800, fontSize: '0.9rem', marginBottom: '4px' }}>BƯỚC 2: THANH TOÁN SHIP KHI NHẬN HÀNG</div>
                    <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
                      Phí vận chuyển cân nặng tính khi hàng về kho VN và giao đến tận tay quý khách.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Bottom CTA Box */}
        <div style={{
          marginTop: '30px',
          background: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
          borderRadius: '20px',
          padding: '24px 32px',
          border: '1px solid #E9D5FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#581C87', margin: '0 0 4px 0' }}>
              Bạn cần tư vấn hoặc giải đáp thêm thắc mắc?
            </h4>
            <p style={{ fontSize: '0.9rem', color: '#7E22CE', margin: 0 }}>
              Đội ngũ chăm sóc khách hàng của TAVY Korea sẵn sàng hỗ trợ bạn 24/7.
            </p>
          </div>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--purple-primary)',
              color: '#FFFFFF',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '0.9rem',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)'
            }}
          >
            <span>Bắt đầu mua hàng ngay</span>
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>

      <Footer />
    </div>
  );
}
