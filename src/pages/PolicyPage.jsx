import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ShoppingBag,
  RotateCcw,
  CreditCard,
  Video,
  ArrowRight
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Footer from '../components/Footer';
import { ORDER_WORKFLOW_STEPS } from '../components/HowItWorksSection';

export default function PolicyPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('workflow'); // 'workflow' | 'order' | 'refund' | 'payment'

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (['workflow', 'order', 'refund', 'payment'].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  const tabs = [
    { id: 'workflow', label: '1. Quy trình 8 bước', icon: Video },
    { id: 'order', label: '2. Quy định & Tỷ giá', icon: ShoppingBag },
    { id: 'refund', label: '3. Đổi trả & Hoàn tiền', icon: RotateCcw },
    { id: 'payment', label: '4. Hướng dẫn thanh toán', icon: CreditCard },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-ivory, #FAF9F6)', color: 'var(--text-dark)' }}>
      <Helmet>
        <title>Quy trình & Chính sách mua hàng - TAVY KOREA</title>
        <meta name="description" content="Quy trình 8 bước mua hàng hộ Hàn Quốc minh bạch có video POV và video đóng hàng, chính sách đổi trả, hoàn tiền và thanh toán tại TAVY Korea." />
      </Helmet>

      {/* Header Banner Thanh Lịch */}
      <div style={{
        background: 'var(--bg-subtle-purple, #1E1B4B)',
        color: 'var(--text-dark, #FFFFFF)',
        borderBottom: '1px solid var(--border-color)',
        padding: '45px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
          <span style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '1.5px',
            color: 'var(--purple-dark, #E0E7FF)',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '10px'
          }}>
            TAVY KOREA • MINH BẠCH & UY TÍN
          </span>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', fontWeight: 700, marginBottom: '10px', color: 'var(--text-dark, #FFFFFF)' }}>
            Quy Trình & Chính Sách Dịch Vụ
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted, #C7D2FE)', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto' }}>
            Quy trình mua hàng hộ minh bạch với video POV mua hàng tại Store Hàn Quốc, video đóng gói từng kiện và chính sách bồi hoàn rõ ràng.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ maxWidth: '980px', margin: '30px auto 60px', width: '100%', padding: '0 20px', flex: 1 }}>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-white, #FFFFFF)',
          borderRadius: '12px',
          padding: '6px',
          border: '1px solid var(--border-color, #E5E7EB)',
          gap: '6px',
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
                  flex: '1 1 180px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                  backgroundColor: isActive ? 'var(--purple-primary)' : 'transparent',
                  color: isActive ? 'var(--bg-white, #FFFFFF)' : 'var(--text-muted, #4B5563)',
                }}
              >
                <Icon size={17} color={isActive ? 'var(--bg-white, #FFFFFF)' : 'var(--text-muted)'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: QUY TRÌNH 8 BƯỚC */}
        {activeTab === 'workflow' && (
          <div style={{ background: 'var(--bg-white, #FFFFFF)', borderRadius: '16px', padding: '32px', border: '1px solid var(--border-color, #E5E7EB)' }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-dark, #111827)', margin: '0 0 6px 0' }}>
                Quy Trình 8 Bước Mua Hàng & Vận Chuyển
              </h2>
              <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.9rem', margin: 0 }}>
                Hệ thống cập nhật trạng thái đơn hàng theo thời gian thực (Realtime) để quý khách tiện theo dõi.
              </p>
            </div>

            <div style={{ display: 'grid', gap: '14px' }}>
              {ORDER_WORKFLOW_STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.step}
                    style={{
                      display: 'flex',
                      gap: '16px',
                      padding: '16px 20px',
                      borderRadius: '12px',
                      background: step.highlight ? 'var(--workflow-highlight-bg, #FAF5FF)' : 'var(--bg-subtle-purple, #F9FAFB)',
                      border: step.highlight ? '1px solid var(--workflow-highlight-border, #D8B4FE)' : '1px solid var(--border-color, #E5E7EB)',
                      alignItems: 'flex-start',
                      boxShadow: step.highlight ? '0 2px 10px rgba(126, 34, 206, 0.08)' : 'none'
                    }}
                  >
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      backgroundColor: step.highlight ? 'var(--workflow-highlight-icon-bg, #7E22CE)' : 'var(--bg-ivory, #E5E7EB)',
                      color: step.highlight ? 'var(--workflow-highlight-icon-color, #FFFFFF)' : 'var(--text-dark, #374151)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon size={19} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '6px' }}>
                        <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-dark, #111827)', margin: 0 }}>
                          <span style={{ color: step.highlight ? 'var(--workflow-highlight-accent, #7E22CE)' : 'var(--text-dark, #111827)', marginRight: '6px' }}>#{step.step}</span>
                          {step.title}
                        </h3>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: step.highlight ? 'var(--workflow-highlight-badge-bg, #7E22CE)' : 'var(--bg-ivory, #E5E7EB)',
                          color: step.highlight ? 'var(--workflow-highlight-badge-color, #FFFFFF)' : 'var(--text-muted, #4B5563)',
                          border: step.highlight ? '1px solid var(--workflow-highlight-border, transparent)' : 'none'
                        }}>
                          {step.badge}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted, #4B5563)', lineHeight: 1.5, margin: 0 }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Quy định & Tỷ giá */}
        {activeTab === 'order' && (
          <div style={{ background: 'var(--bg-white, #FFFFFF)', borderRadius: '16px', padding: '32px', border: '1px solid var(--border-color, #E5E7EB)' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-dark, #111827)', marginBottom: '20px' }}>
              Quy Định Đặt Mua & Cách Tính Cước Phí Trọn Gói
            </h2>

            <div style={{ display: 'grid', gap: '16px', color: 'var(--text-dark, #374151)', lineHeight: '1.6', fontSize: '0.9rem' }}>
              <div style={{ background: 'var(--bg-subtle-purple, #F9FAFB)', padding: '18px', borderRadius: '10px', borderLeft: '3px solid #8B5CF6' }}>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-dark, #111827)', marginBottom: '4px' }}>1. Nguồn hàng mua hộ</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                  TAVY Korea nhận order trực tiếp từ các hệ thống phân phối chính hãng uy tín tại Hàn Quốc: <strong>Olive Young (Mỹ phẩm, Skincare), KGC CheongKwanJang & Nonghyup (Hồng sâm, TPCN y tế), Naver Brand Store, các hiệu thuốc nội địa và trung tâm thương mại lớn tại Seoul</strong> (Cam kết 100% chính hãng, đầy đủ bill mua hàng điện tử hoặc hóa đơn store).
                </p>
              </div>

              <div style={{ background: 'var(--bg-subtle-purple, #F9FAFB)', padding: '18px', borderRadius: '10px', borderLeft: '3px solid #3B82F6' }}>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-dark, #111827)', marginBottom: '4px' }}>2. Quy định về giá bán & Tỷ giá Won (KRW)</h3>
                <ul style={{ paddingLeft: '18px', margin: 0, color: 'var(--text-muted)' }}>
                  <li><strong>Giá gốc tại Hàn (Won ₩):</strong> Tính theo giá niêm yết tại store hoặc website Hàn Quốc (ưu tiên áp dụng giá sale tại thời điểm đặt cọc).</li>
                  <li><strong>Tỷ giá Won (KRW):</strong> Niêm yết công khai và cập nhật minh bạch theo hệ thống thời gian thực (tỷ giá hiện hành khoảng 19.5đ/Won).</li>
                  <li><strong>Công thức tính giá trọn gói về tay:</strong> <code>Giá về tay (VNĐ) = Giá gốc Won x Tỷ giá KRW x (1 + Phí dịch vụ mua hộ 5%)</code>.</li>
                  <li><strong>Thanh toán 1 lần duy nhất:</strong> Giá về tay hiển thị trên web đã bao gồm 100% tiền hàng, công mua hộ, đóng gói 3 lớp và phí vận chuyển quốc tế. Quý khách <strong>không phải thanh toán thêm bất kỳ phụ phí ẩn hay tiền cân nặng nào khác</strong>.</li>
                </ul>
              </div>

              <div style={{ background: 'var(--bg-subtle-purple, #F9FAFB)', padding: '18px', borderRadius: '10px', borderLeft: '3px solid #10B981' }}>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-dark, #111827)', marginBottom: '4px' }}>3. Thời gian giao hàng (Hàn Quốc ✈️ Việt Nam)</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                  - <strong>100% Vận chuyển đường bay chuyên tuyến (Incheon ✈️ Hà Nội / TP.HCM):</strong> Thời gian từ <strong>3 - 7 ngày làm việc</strong> kể từ khi xuất kho Seoul.<br />
                  - <strong>Bảo toàn chất lượng:</strong> TAVY Korea chỉ vận chuyển đường bay nhanh để bảo quản tối ưu chất lượng mỹ phẩm và thực phẩm chức năng, tuyệt đối không đi đường biển nóng ẩm.
                </p>
              </div>

              <div style={{ background: 'var(--bg-subtle-purple, #F9FAFB)', padding: '18px', borderRadius: '10px', borderLeft: '3px solid #F59E0B' }}>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-dark, #111827)', marginBottom: '4px' }}>4. Quy định đơn hàng tối thiểu</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                  - <strong>Đơn hàng tối thiểu: 1.000.000 VNĐ</strong> để tối ưu chi phí gom chuyến bay quốc tế từ Hàn Quốc và bảo đảm tiêu chuẩn đóng thùng chống sốc 3 lớp an toàn.
                </p>
              </div>

              <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <p style={{ margin: 0, color: 'var(--text-dark)', fontSize: '0.88rem' }}>
                  <strong style={{ color: '#F59E0B' }}>Lưu ý:</strong> Sau khi đơn hàng đã được TAVY tiến hành mua tại cửa hàng Hàn Quốc (đã có Video POV), quý khách vui lòng không thay đổi hoặc hủy đơn do chính sách không hoàn hủy của các hệ thống bán lẻ tại Hàn Quốc.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Đổi trả & Hoàn tiền */}
        {activeTab === 'refund' && (
          <div style={{ background: 'var(--bg-white, #FFFFFF)', borderRadius: '16px', padding: '32px', border: '1px solid var(--border-color, #E5E7EB)' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-dark, #111827)', marginBottom: '20px' }}>
              Chính Sách Đổi Trả, Đền Bù & Hoàn Tiền
            </h2>

            <div style={{ display: 'grid', gap: '16px', color: 'var(--text-dark, #374151)', lineHeight: '1.6', fontSize: '0.9rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '18px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#10B981', marginBottom: '6px' }}>
                  Trường hợp được ĐỀN BÙ 100% hoặc HOÀN TIỀN
                </h3>
                <ul style={{ paddingLeft: '18px', margin: 0, color: 'var(--text-muted)' }}>
                  <li>Sản phẩm bị phát hiện là <strong>hàng không chính hãng</strong> (Cam kết đền gấp 10 lần giá trị).</li>
                  <li>Hàng bị <strong>thất lạc, mất mát</strong> trong quá trình vận chuyển.</li>
                  <li>Sản phẩm bị <strong>vỡ bể, hư hỏng nặng</strong> do vận chuyển (Quý khách vui lòng quay video khi khui kiện hàng).</li>
                  <li>TAVY mua <strong>sai phân loại hoặc dung tích</strong> so với đơn đặt hàng đã xác nhận.</li>
                  <li>Shop Hàn Quốc <strong>báo hết hàng hoặc hủy đơn</strong>: Hoàn lại 100% tiền cọc trong vòng 24 giờ.</li>
                </ul>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '18px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#EF4444', marginBottom: '6px' }}>
                  Trường hợp KHÔNG hỗ trợ đổi trả
                </h3>
                <ul style={{ paddingLeft: '18px', margin: 0, color: 'var(--text-muted)' }}>
                  <li>Khách hàng tự đổi ý sau khi hàng đã được mua thành công tại Hàn Quốc.</li>
                  <li>Hộp ngoài sản phẩm bị móp nhẹ trong quá trình vận chuyển nhưng <strong>chất lượng bên trong nguyên vẹn</strong>.</li>
                  <li>Sản phẩm đã bị bóc seal, mở nắp hoặc qua sử dụng sau khi nhận tại Việt Nam.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Hướng dẫn thanh toán */}
        {activeTab === 'payment' && (
          <div style={{ background: 'var(--bg-white, #FFFFFF)', borderRadius: '16px', padding: '32px', border: '1px solid var(--border-color, #E5E7EB)' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-dark, #111827)', marginBottom: '20px' }}>
              Hướng Dẫn Thanh Toán & Đặt Cọc Trọn Gói
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              {/* VietQR */}
              <div style={{ background: 'var(--bg-subtle-purple, #F9FAFB)', border: '1px solid var(--border-color, #E5E7EB)', padding: '18px', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark, #111827)', marginBottom: '8px' }}>
                  1. Chuyển khoản VND (VietQR)
                </h3>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted, #374151)', lineHeight: '1.6' }}>
                  <div><strong>Ngân hàng:</strong> MBBank (Quân Đội)</div>
                  <div><strong>Số tài khoản:</strong> 1330042000</div>
                  <div><strong>Chủ TK:</strong> LE THI HA VY</div>
                </div>
              </div>

              {/* Woori Bank */}
              <div style={{ background: 'var(--bg-subtle-purple, #F9FAFB)', border: '1px solid var(--border-color, #E5E7EB)', padding: '18px', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark, #111827)', marginBottom: '8px' }}>
                  2. Chuyển khoản KRW (Woori Bank)
                </h3>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted, #374151)', lineHeight: '1.6' }}>
                  <div><strong>Ngân hàng:</strong> Woori Bank (우리은행)</div>
                  <div><strong>Số tài khoản:</strong> 1002959863658</div>
                  <div><strong>Chủ TK:</strong> VU VAN TAN</div>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-subtle-purple, #F9FAFB)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color, #E5E7EB)' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dark, #111827)', marginBottom: '8px' }}>
                Quy trình cọc & Thanh toán trọn gói 1 lần:
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.88rem', color: 'var(--text-muted, #4B5563)', lineHeight: '1.55' }}>
                <div>• <strong>Thanh toán cọc 100% giá về tay:</strong> Quý khách đặt cọc 100% giá trị đơn hàng để TAVY tiến hành mua trực tiếp tại Store Hàn Quốc và quay video POV.</div>
                <div>• <strong>Trọn gói 1 lần - Không phát sinh chi phí:</strong> Giá thanh toán đã bao gồm toàn bộ tiền hàng, công mua hộ, đóng gói 3 lớp và cước bay về tận tay quý khách tại Việt Nam. Khi nhận hàng, quý khách <strong>không cần phải thanh toán thêm bất kỳ khoản phí cân nặng hay phụ phí nào khác</strong>.</div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{
          marginTop: '24px',
          background: 'var(--bg-white, #FFFFFF)',
          borderRadius: '14px',
          padding: '20px 24px',
          border: '1px solid var(--border-color, #E5E7EB)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark, #111827)' }}>
              Cần hỗ trợ hoặc gửi link sản phẩm báo giá?
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #6B7280)', margin: '2px 0 0 0' }}>
              Đội ngũ TAVY Korea sẵn sàng tư vấn trực tiếp 24/7.
            </p>
          </div>
          <Link
            to="/"
            className="btn-gold"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '0.88rem'
            }}
          >
            <span>Mua hàng ngay</span>
            <ArrowRight size={15} />
          </Link>
        </div>

      </div>

      <Footer />
    </div>
  );
}
