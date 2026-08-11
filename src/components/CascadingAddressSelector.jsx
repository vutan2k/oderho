import React, { useState, useEffect, useRef } from 'react';
import { fetchVietnamProvinces, fetchVietnamSubDivisions } from '../services/vietnamAddressService';
import { MapPin, Building, Navigation } from 'lucide-react';

export default function CascadingAddressSelector({ initialAddress = '', onChange, required = true }) {
  const [provinces, setProvinces] = useState([]);
  const [subDivisions, setSubDivisions] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingSubDivisions, setLoadingSubDivisions] = useState(false);

  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedProvinceName, setSelectedProvinceName] = useState('');
  const [selectedSubDivisionCode, setSelectedSubDivisionCode] = useState('');
  const [selectedSubDivisionName, setSelectedSubDivisionName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');

  const isInitialParsedRef = useRef(false);

  // 1. Fetch 63 Provinces from Vietnam Open API (or fallback)
  useEffect(() => {
    let isMounted = true;
    async function loadProvinces() {
      setLoadingProvinces(true);
      const list = await fetchVietnamProvinces();
      if (isMounted) {
        setProvinces(list);
        setLoadingProvinces(false);
      }
    }
    loadProvinces();
    return () => { isMounted = false; };
  }, []);

  // 2. Parse initialAddress CHỈ NẾU là địa chỉ thực sự của người dùng (tuyệt đối KHÔNG tự điền Tỉnh/TP vào ô Số nhà)
  useEffect(() => {
    if (initialAddress && typeof initialAddress === 'string' && !isInitialParsedRef.current) {
      isInitialParsedRef.current = true;
      const parts = initialAddress.split(',').map(s => s.trim()).filter(Boolean);
      // Tìm phần tử không chứa từ khóa Tỉnh/Thành phố/Quận/Huyện/Xã/Phường
      const actualStreet = parts.find(p => 
        !p.startsWith('Tỉnh') && 
        !p.startsWith('Thành phố') && 
        !p.startsWith('Quận') && 
        !p.startsWith('Huyện') && 
        !p.startsWith('Phường') && 
        !p.startsWith('Xã') && 
        !p.includes('Việt Nam')
      );

      // Nếu chỉ có tên Tỉnh/TP thì để trống hoàn toàn
      if (actualStreet) {
        setStreetAddress(actualStreet);
      } else {
        setStreetAddress('');
      }
    }
  }, [initialAddress]);

  // 3. Fetch 2nd Level (Xã / Phường / Quận / Huyện) when Province changes
  useEffect(() => {
    let isMounted = true;
    async function loadSubDivisions() {
      if (!selectedProvinceCode) {
        setSubDivisions([]);
        setSelectedSubDivisionCode('');
        setSelectedSubDivisionName('');
        return;
      }

      setLoadingSubDivisions(true);
      const list = await fetchVietnamSubDivisions(selectedProvinceCode);
      if (isMounted) {
        setSubDivisions(list);
        setLoadingSubDivisions(false);
      }
    }
    loadSubDivisions();
    return () => { isMounted = false; };
  }, [selectedProvinceCode]);

  // 4. Emit clean full address to parent
  useEffect(() => {
    const parts = [
      streetAddress.trim(),
      selectedSubDivisionName,
      selectedProvinceName
    ].filter(Boolean);

    const uniqueParts = [];
    parts.forEach(p => {
      if (p && !uniqueParts.includes(p)) uniqueParts.push(p);
    });

    const fullAddress = uniqueParts.join(', ');

    if (onChange) {
      onChange({
        provinceCode: selectedProvinceCode,
        provinceName: selectedProvinceName,
        subDivisionCode: selectedSubDivisionCode,
        subDivisionName: selectedSubDivisionName,
        streetAddress: streetAddress.trim(),
        fullAddress
      });
    }
  }, [selectedProvinceCode, selectedProvinceName, selectedSubDivisionCode, selectedSubDivisionName, streetAddress, onChange]);

  // Handlers
  const handleProvinceSelect = (e) => {
    const code = e.target.value;
    setSelectedProvinceCode(code);
    const pObj = provinces.find(p => String(p.code) === String(code));
    setSelectedProvinceName(pObj ? pObj.name : '');
    setSelectedSubDivisionCode('');
    setSelectedSubDivisionName('');
  };

  const handleSubDivisionSelect = (e) => {
    const code = e.target.value;
    setSelectedSubDivisionCode(code);
    const subObj = subDivisions.find(s => String(s.code) === String(code));
    setSelectedSubDivisionName(subObj ? subObj.name : '');
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#374151',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid #D1D5DB',
    fontSize: '0.88rem',
    backgroundColor: '#FFF',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
  };

  return (
    <div style={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
      
      {/* Sleek Minimal Header - CHỈ ĐỂ "ĐỊA CHỈ" */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
        <MapPin size={16} color="var(--purple-primary)" />
        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          ĐỊA CHỈ {required && <span style={{ color: '#EF4444' }}>*</span>}
        </span>
      </div>

      {/* 2 Cấp Hành Chính (Tỉnh/Thành phố → Xã/Phường/Quận/Huyện) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        
        {/* Cấp 1: Tỉnh / Thành phố */}
        <div>
          <label style={labelStyle}>
            <Building size={12} style={{ display: 'inline', marginRight: '4px' }} /> Tỉnh / Thành Phố
          </label>
          <select
            value={selectedProvinceCode}
            onChange={handleProvinceSelect}
            style={inputStyle}
            required={required}
          >
            <option value="">{loadingProvinces ? 'Đang tải...' : '-- Chọn Tỉnh / TP --'}</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Cấp 2: Xã / Phường / Quận / Huyện */}
        <div>
          <label style={labelStyle}>
            <Navigation size={12} style={{ display: 'inline', marginRight: '4px' }} /> Xã / Phường / Quận / Huyện
          </label>
          <select
            value={selectedSubDivisionCode}
            onChange={handleSubDivisionSelect}
            disabled={!selectedProvinceCode || loadingSubDivisions}
            style={{ ...inputStyle, opacity: !selectedProvinceCode ? 0.6 : 1 }}
            required={required}
          >
            <option value="">{loadingSubDivisions ? 'Đang tải...' : (selectedProvinceCode ? '-- Chọn Xã/Phường/Quận/Huyện --' : '-- Chọn Tỉnh/TP trước --')}</option>
            {subDivisions.map((s) => (
              <option key={s.code} value={s.code}>{s.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Cấp 3: Số nhà & Tên đường */}
      <div>
        <label style={labelStyle}>Số Nhà & Tên Đường</label>
        <input
          type="text"
          placeholder="Số nhà, tên đường..."
          value={streetAddress}
          onChange={(e) => setStreetAddress(e.target.value)}
          style={inputStyle}
          required={required}
        />
      </div>

    </div>
  );
}
