import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { HelpCircle, Sparkles, ArrowRight, Info } from 'lucide-react';

export default function Calculator({ onUseCalculation }) {
  const { rates } = useContext(AppContext);
  const [country, setCountry] = useState('KRW');
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('0.2');
  const [taxPercent, setTaxPercent] = useState('10'); // Default tax (Korea/Japan often 10%, USA ~8%)

  const [results, setResults] = useState(null);

  // Sync tax percent on country change
  useEffect(() => {
    if (country === 'KRW') {
      setTaxPercent('10');
    } else if (country === 'USD') {
      setTaxPercent('8');
    } else if (country === 'JPY') {
      setTaxPercent('10');
    }
  }, [country]);

  const rateInfo = rates[country];

  useEffect(() => {
    if (!price || isNaN(price) || parseFloat(price) <= 0) {
      setResults(null);
      return;
    }

    const priceNum = parseFloat(price);
    const weightNum = parseFloat(weight) || 0;
    const taxPercentNum = parseFloat(taxPercent) || 0;

    const rate = rateInfo.rate;
    const rawVnd = priceNum * rate;
    const taxWebVnd = (rawVnd * taxPercentNum) / 100;
    const serviceFeeVnd = (rawVnd * rates.serviceFeePercent) / 100;
    const shippingWeightFeeVnd = weightNum * rateInfo.shippingFee;
    const totalVnd = Math.round(rawVnd + taxWebVnd + serviceFeeVnd + shippingWeightFeeVnd);
    const depositVnd = Math.round(totalVnd * 0.5); // 50% deposit

    setResults({
      rawVnd,
      taxWebVnd,
      serviceFeeVnd,
      shippingWeightFeeVnd,
      totalVnd,
      depositVnd,
      currencySymbol: rateInfo.symbol,
      rate,
    });
  }, [country, price, weight, taxPercent, rates, rateInfo]);

  const formatVnd = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const handleApplyCalculation = () => {
    if (results && onUseCalculation) {
      onUseCalculation({
        country,
        foreignPrice: parseFloat(price),
        qty: 1,
        weight: parseFloat(weight) || 0,
      });
    }
  };

  return (
    <div className="glass" style={{
      borderRadius: 'var(--radius-lg)',
      padding: '35px',
      maxWidth: '650px',
      margin: '0 auto',
      boxShadow: 'var(--shadow-lg)',
      border: '1px solid var(--border-color)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <Sparkles size={18} style={{ color: 'var(--primary-rose)' }} />
        <h2 style={{ fontSize: '1.6rem', color: 'var(--charcoal)' }}>Công cụ tính giá tạm tính</h2>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--charcoal-light)', marginBottom: '25px' }}>
        Nhập giá web nước ngoài để biết ngay tổng chi phí về tay tại Việt Nam chỉ trong 1 giây!
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        
        {/* Country Select */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Chọn quốc gia mua hàng</label>
          <select 
            className="form-control" 
            value={country} 
            onChange={(e) => setCountry(e.target.value)}
            style={{ height: '48px' }}
          >
            <option value="USD">Mỹ (Sephora, Ulta...) - Tỷ giá: {formatVnd(rates.USD.rate)}</option>
            <option value="KRW">Hàn Quốc (Olive Young...) - Tỷ giá: {rates.KRW.rate}đ</option>
            <option value="JPY">Nhật Bản (Amazon JP...) - Tỷ giá: {rates.JPY.rate}đ</option>
          </select>
        </div>

        {/* Foreign Price Input */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Giá gốc trên web ({rateInfo.symbol})</label>
          <div className="input-with-addon">
            <span className="input-addon">{rateInfo.symbol}</span>
            <input 
              type="number" 
              className="form-control" 
              placeholder="VD: 45.00" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="0.01"
              required 
            />
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '25px' }}>
        
        {/* Tax Web Percent */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Thuế Web / Phí Ship nội địa</span>
            <span title="Thuế bang tại Mỹ hoặc thuế tiêu dùng tại Hàn/Nhật (nếu có)" style={{ cursor: 'pointer', display: 'inline-flex' }}>
              <HelpCircle size={14} style={{ color: 'var(--charcoal-light)' }} />
            </span>
          </label>
          <div className="input-with-addon">
            <input 
              type="number" 
              className="form-control" 
              placeholder="VD: 8" 
              value={taxPercent} 
              onChange={(e) => setTaxPercent(e.target.value)}
              min="0"
              max="30"
            />
            <span className="input-addon">%</span>
          </div>
        </div>

        {/* Estimated Weight */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Cân nặng ước tính</span>
            <span title="Dùng để tính cước vận chuyển bay về VN. Son: ~0.1kg, Toner: ~0.3kg, Kem dưỡng: ~0.2kg" style={{ cursor: 'pointer', display: 'inline-flex' }}>
              <HelpCircle size={14} style={{ color: 'var(--charcoal-light)' }} />
            </span>
          </label>
          <div className="input-with-addon">
            <input 
              type="number" 
              className="form-control" 
              placeholder="VD: 0.2" 
              value={weight} 
              onChange={(e) => setWeight(e.target.value)}
              min="0"
              step="0.05"
            />
            <span className="input-addon">KG</span>
          </div>
        </div>

      </div>

      {results ? (
        <div className="animate-fade-in" style={{
          backgroundColor: 'var(--primary-rose-light)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          border: '1px solid rgba(183, 110, 121, 0.25)',
        }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--primary-rose-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Bảng chi tiết giá quy đổi (VND)
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--charcoal-light)' }}>Giá sản phẩm ({price} {rateInfo.symbol} × {results.rate}đ):</span>
              <span style={{ fontWeight: 500 }}>{formatVnd(results.rawVnd)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--charcoal-light)' }}>Thuế web / Ship hãng ({taxPercent}%):</span>
              <span style={{ fontWeight: 500 }}>{formatVnd(results.taxWebVnd)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--charcoal-light)' }}>Phí mua hộ ({rates.serviceFeePercent}%):</span>
              <span style={{ fontWeight: 500 }}>{formatVnd(results.serviceFeeVnd)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--charcoal-light)' }}>Cước bay quốc tế ({weight}kg × {formatVnd(rateInfo.shippingFee)}/kg):</span>
              <span style={{ fontWeight: 500 }}>{formatVnd(results.shippingWeightFeeVnd)}</span>
            </div>

            <div style={{ borderTop: '1px dashed var(--primary-rose)', margin: '8px 0' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Tổng chi phí về tay:</span>
              <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary-rose-dark)' }}>{formatVnd(results.totalVnd)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--charcoal-light)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Info size={13} />
                Tiền cọc tối thiểu (50%):
              </span>
              <span style={{ fontWeight: 600, color: 'var(--charcoal)' }}>{formatVnd(results.depositVnd)}</span>
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            onClick={handleApplyCalculation}
            style={{ width: '100%', marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '8px' }}
          >
            <span>Tạo Đơn Hàng Mua Hộ Bằng Giá Này</span>
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div style={{
          border: '1.5px dashed var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '30px',
          textAlign: 'center',
          color: 'var(--charcoal-light)',
          fontSize: '0.9rem'
        }}>
          Hãy nhập giá gốc sản phẩm để xem báo giá chi tiết tự động.
        </div>
      )}
    </div>
  );
}
