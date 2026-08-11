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

  // 2. Parse initialAddress ONLY ONCE on mount (prevent circular state loop!)
  useEffect(() => {
    if (initialAddress && typeof initialAddress === 'string' && !isInitialParsedRef.current) {
      isInitialParsedRef.current = true;

      // Extract street part if initialAddress is a comma-separated full string
      const parts = initialAddress.split(',').map(s => s.trim()).filter(Boolean);
      if (parts.length > 0) {
        // If initial address contains multiple parts, take first part as street address
        const possibleStreet = parts.find(p => !p.includes('Việt Nam') && !p.includes('Thành phố') && !p.includes('Tỉnh'));
        setStreetAddress(possibleStreet || parts[0]);
      } else {
        setStreetAddress(initialAddress);
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

  // 4. Emit structured Address & Full String to parent without circular state loop
  useEffect(() => {
    const parts = [
      streetAddress.trim(),
      selectedSubDivisionName,
      selectedProvinceName
    ].filter(Boolean);

    // Dedupe parts
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
  }, [selectedProvinceCode, selectedProvinceName, selectedSubDivisionCode, selectedSubDivisionName, streetAddress]);

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
    <div style={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', padding: '18px', borderRadius: '12px', marginBottom: '16px' }}>
      
      {/* Sleek Minimal Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
        <MapPin size={16} color="var(--purple-primary)" />
        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          ĐỊA CHỈ {required && <span style={{ color: '#EF4444' }}>*</span>}
        </h4>
      </div>

      {/* 2 Cascading Levels (Vietnam Open API 2-Level) */}
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
            <option value="">{loadingProvinces ? 'Đang tải danh sách...' : '-- Chọn Tỉnh / Thành Phố --'}</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Cấp 2: Quận / Huyện / Phường / Xã */}
        <div>
          <label style={labelStyle}>
            <Navigation size={12} style={{ display: 'inline', marginRight: '4px' }} /> Quận / Huyện / Phường / Xã
          </label>
          <select
            value={selectedSubDivisionCode}
            onChange={handleSubDivisionSelect}
            disabled={!selectedProvinceCode || loadingSubDivisions}
            style={{ ...inputStyle, opacity: !selectedProvinceCode ? 0.6 : 1 }}
            required={required}
          >
            <option value="">{loadingSubDivisions ? 'Đang tải...' : (selectedProvinceCode ? '-- Chọn Quận / Huyện / Phường / Xã --' : '-- Chọn Tỉnh/TP trước --')}</option>
            {subDivisions.map((s) => (
              <option key={s.code} value={s.code}>{s.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Cấp 3: Số nhà & Tên đường */}
      <div>
        <label style={labelStyle}>Số Nhà & Tên Đường (Địa Chỉ Cụ Thể)</label>
        <input
          type="text"
          placeholder="VD: Số 123 Đường Lê Lợi, Tòa nhà Bitexco..."
          value={streetAddress}
          onChange={(e) => setStreetAddress(e.target.value)}
          style={inputStyle}
          required={required}
        />
      </div>

    </div>
  );
}
