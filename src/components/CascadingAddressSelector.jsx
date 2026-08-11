import React, { useState, useEffect } from 'react';
import { LOCATION_DATA } from '../data/vietnamAddressData';
import { MapPin, Globe, Building, Navigation, Home } from 'lucide-react';

export default function CascadingAddressSelector({ initialAddress = '', onChange, required = true }) {
  // Level States
  const [selectedCountryCode, setSelectedCountryCode] = useState('VN');
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
  const [selectedWardName, setSelectedWardName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');

  // Repopulate Cascading Lists
  const countryObj = LOCATION_DATA[selectedCountryCode] || LOCATION_DATA['VN'];
  const provinceList = countryObj.provinces || [];

  const provinceObj = provinceList.find((p) => p.code === selectedProvinceCode);
  const districtList = provinceObj ? provinceObj.districts : [];

  const districtObj = districtList.find((d) => d.code === selectedDistrictCode);
  const wardList = districtObj ? districtObj.wards : [];

  // Parse initial address string on first mount if provided
  useEffect(() => {
    if (initialAddress && typeof initialAddress === 'string' && !selectedProvinceCode) {
      setStreetAddress(initialAddress);
      // Auto-select SG / District if matching keyword
      if (initialAddress.includes('Hồ Chí Minh') || initialAddress.includes('TP.HCM') || initialAddress.includes('Sài Gòn')) {
        setSelectedCountryCode('VN');
        setSelectedProvinceCode('SG');
      } else if (initialAddress.includes('Hà Nội')) {
        setSelectedCountryCode('VN');
        setSelectedProvinceCode('HN');
      } else if (initialAddress.includes('Đà Nẵng')) {
        setSelectedCountryCode('VN');
        setSelectedProvinceCode('DN');
      }
    }
  }, [initialAddress]);

  // Construct formatted full address
  useEffect(() => {
    const provinceName = provinceObj ? provinceObj.name : '';
    const districtName = districtObj ? districtObj.name : '';

    const parts = [
      streetAddress.trim(),
      selectedWardName,
      districtName,
      provinceName,
      countryObj ? countryObj.name : ''
    ].filter(Boolean);

    const fullAddress = parts.join(', ');

    if (onChange) {
      onChange({
        countryCode: selectedCountryCode,
        countryName: countryObj ? countryObj.name : '',
        provinceCode: selectedProvinceCode,
        provinceName,
        districtCode: selectedDistrictCode,
        districtName,
        wardName: selectedWardName,
        streetAddress: streetAddress.trim(),
        fullAddress
      });
    }
  }, [selectedCountryCode, selectedProvinceCode, selectedDistrictCode, selectedWardName, streetAddress]);

  // Handle Level Cascading Resets
  const handleCountryChange = (e) => {
    const code = e.target.value;
    setSelectedCountryCode(code);
    setSelectedProvinceCode('');
    setSelectedDistrictCode('');
    setSelectedWardName('');
  };

  const handleProvinceChange = (e) => {
    const code = e.target.value;
    setSelectedProvinceCode(code);
    setSelectedDistrictCode('');
    setSelectedWardName('');
  };

  const handleDistrictChange = (e) => {
    const code = e.target.value;
    setSelectedDistrictCode(code);
    setSelectedWardName('');
  };

  const handleWardChange = (e) => {
    setSelectedWardName(e.target.value);
  };

  // Modern Form Styling
  const labelStyle = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#374151',
    marginBottom: '4px',
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
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
  };

  return (
    <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px' }}>
        <MapPin size={16} color="var(--purple-primary)" />
        <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: 'var(--purple-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          ĐỊA CHỈ NHẬN HÀNG PHÂN CẤP (CASCADING LOCATION)
        </h4>
      </div>

      {/* Grid Dropdowns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '12px' }}>
        
        {/* 1. Quốc gia */}
        <div>
          <label style={labelStyle}>
            <Globe size={11} style={{ display: 'inline', marginRight: '3px' }} /> Quốc Gia
          </label>
          <select value={selectedCountryCode} onChange={handleCountryChange} style={inputStyle} required={required}>
            {Object.keys(LOCATION_DATA).map((cKey) => (
              <option key={cKey} value={cKey}>{LOCATION_DATA[cKey].name}</option>
            ))}
          </select>
        </div>

        {/* 2. Tỉnh / Thành phố */}
        <div>
          <label style={labelStyle}>
            <Building size={11} style={{ display: 'inline', marginRight: '3px' }} /> Tỉnh / Thành Phố
          </label>
          <select value={selectedProvinceCode} onChange={handleProvinceChange} style={inputStyle} required={required}>
            <option value="">-- Chọn Tỉnh / TP --</option>
            {provinceList.map((p) => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* 3. Quận / Huyện / Thị xã */}
        <div>
          <label style={labelStyle}>
            <Navigation size={11} style={{ display: 'inline', marginRight: '3px' }} /> Quận / Huyện
          </label>
          <select
            value={selectedDistrictCode}
            onChange={handleDistrictChange}
            disabled={!selectedProvinceCode}
            style={{ ...inputStyle, opacity: !selectedProvinceCode ? 0.6 : 1 }}
            required={required}
          >
            <option value="">-- Chọn Quận / Huyện --</option>
            {districtList.map((d) => (
              <option key={d.code} value={d.code}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* 4. Phường / Xã */}
        <div>
          <label style={labelStyle}>
            <Home size={11} style={{ display: 'inline', marginRight: '3px' }} /> Phường / Xã
          </label>
          <select
            value={selectedWardName}
            onChange={handleWardChange}
            disabled={!selectedDistrictCode}
            style={{ ...inputStyle, opacity: !selectedDistrictCode ? 0.6 : 1 }}
            required={required}
          >
            <option value="">-- Chọn Phường / Xã --</option>
            {wardList.map((w, idx) => (
              <option key={idx} value={w}>{w}</option>
            ))}
          </select>
        </div>

      </div>

      {/* 5. Số nhà & Tên đường */}
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
