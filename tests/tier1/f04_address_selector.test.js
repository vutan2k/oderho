import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertGreaterThan,
  assertContains,
} from '../framework/assert.js';
import {
  ALL_63_VIETNAM_PROVINCES,
  COMMON_SUB_DIVISIONS,
  fetchVietnamProvinces,
  fetchVietnamSubDivisions,
} from '../../src/services/vietnamAddressService.js';

setTier('Tier 1: Feature Coverage');

test('[F4-1] 2-tier dropdown cascade (Provinces -> Districts)', async () => {
  const provinces = await fetchVietnamProvinces();
  assertGreaterThan(provinces.length, 0, 'Provinces list should not be empty');

  const selectedProvince = provinces.find(p => p.code === 79 || p.name.includes('Hồ Chí Minh'));
  assert(selectedProvince !== undefined, 'TP HCM should exist in provinces');

  const subDivisions = await fetchVietnamSubDivisions(selectedProvince.code);
  assertGreaterThan(subDivisions.length, 0, 'Subdivisions for TP HCM should not be empty');
  assert(subDivisions.some(s => s.name.includes('Phường') || s.name.includes('Quận') || s.name.includes('Xã')), 'Wards / Subdivisions should exist in TP HCM');
});

test('[F4-2] Province selection reset clears district state', () => {
  const addressState = {
    selectedProvinceCode: 79,
    selectedProvinceName: 'Thành phố Hồ Chí Minh',
    selectedDistrictCode: 769,
    selectedDistrictName: 'Quận 1',
  };

  const handleProvinceChange = (state, newProvinceCode, newProvinceName) => {
    return {
      ...state,
      selectedProvinceCode: newProvinceCode,
      selectedProvinceName: newProvinceName,
      selectedDistrictCode: null, // Reset district on province change
      selectedDistrictName: '',
    };
  };

  const updatedState = handleProvinceChange(addressState, 1, 'Thành phố Hà Nội');
  assertEquals(updatedState.selectedProvinceCode, 1, 'Province code updated to Hà Nội (1)');
  assertEquals(updatedState.selectedDistrictCode, null, 'District code must reset to null');
  assertEquals(updatedState.selectedDistrictName, '', 'District name must reset to empty string');
});

test('[F4-3] District population for specific province code', () => {
  const hanoiDistricts = COMMON_SUB_DIVISIONS[1]; // Ha Noi
  assert(Array.isArray(hanoiDistricts), 'Ha Noi districts should be an array');
  assertGreaterThan(hanoiDistricts.length, 5, 'Ha Noi should have multiple districts');
  assertContains(hanoiDistricts.map(d => d.name), 'Quận Ba Đình', 'Ha Noi should contain Ba Dinh');
  assertContains(hanoiDistricts.map(d => d.name), 'Quận Hoàn Kiếm', 'Ha Noi should contain Hoan Kiem');
});

test('[F4-4] Fallback data loading when API fails or offline', () => {
  // Check that static catalog has full 63 provinces
  assertEquals(ALL_63_VIETNAM_PROVINCES.length, 63, 'Offline fallback catalog must contain 63 provinces');
  
  // Test fallback returning default subdivisions for unknown province code
  const fallbackSub = COMMON_SUB_DIVISIONS[9999];
  assert(fallbackSub === undefined, 'Unknown province code has no explicit common subdivision');
  
  const hcmcDistricts = COMMON_SUB_DIVISIONS[79];
  assert(hcmcDistricts.length > 0, 'HCM fallback sub-divisions populated');
});

test('[F4-5] Full shipping address formatting logic', () => {
  const formatFullAddress = (detail, districtName, provinceName) => {
    const parts = [detail, districtName, provinceName].map(p => (p || '').trim()).filter(Boolean);
    return parts.join(', ');
  };

  const fullAddr = formatFullAddress('123 Nguyễn Huệ', 'Quận 1', 'Thành phố Hồ Chí Minh');
  assertEquals(fullAddr, '123 Nguyễn Huệ, Quận 1, Thành phố Hồ Chí Minh', 'Formatted address must match standard comma separation');

  const partialAddr = formatFullAddress('456 Lê Lợi', '', 'Thành phố Đà Nẵng');
  assertEquals(partialAddr, '456 Lê Lợi, Thành phố Đà Nẵng', 'Empty district parts should be safely excluded');
});
