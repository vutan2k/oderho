import { setTier, test } from '../framework/runner.js';
import {
  assertEquals,
  assertThrows,
} from '../framework/assert.js';

setTier('Tier 2: Boundary & Corner Cases');

test('[F7-B1] Zero and negative exchange rate rejection', () => {
  const updateExchangeRate = (currency, rate) => {
    const numericRate = Number(rate);
    if (isNaN(numericRate) || numericRate <= 0) {
      throw new Error(`Tỷ giá ${currency} phải là một số dương lớn hơn 0!`);
    }
    return { currency, rate: numericRate };
  };

  assertThrows(() => updateExchangeRate('KRW', 0), 'lớn hơn 0');
  assertThrows(() => updateExchangeRate('KRW', -19.5), 'lớn hơn 0');
  assertEquals(updateExchangeRate('KRW', 19.5).rate, 19.5, 'Positive rate accepted');
});

test('[F7-B2] Zero service fee % boundary', () => {
  const calculateServiceFee = (itemTotalVnd, serviceFeePercent) => {
    const percent = Number(serviceFeePercent);
    if (isNaN(percent) || percent < 0 || percent > 100) {
      throw new Error('Phí dịch vụ phải nằm trong khoảng 0% - 100%');
    }
    return Math.round(itemTotalVnd * (percent / 100));
  };

  assertEquals(calculateServiceFee(1000000, 0), 0, '0% service fee calculates 0 VND fee');
});

test('[F7-B3] 100% service fee upper boundary', () => {
  const calculateServiceFee = (itemTotalVnd, serviceFeePercent) => {
    const percent = Number(serviceFeePercent);
    if (isNaN(percent) || percent < 0 || percent > 100) {
      throw new Error('Phí dịch vụ phải nằm trong khoảng 0% - 100%');
    }
    return Math.round(itemTotalVnd * (percent / 100));
  };

  assertEquals(calculateServiceFee(1000000, 100), 1000000, '100% service fee equals item total');
  assertThrows(() => calculateServiceFee(1000000, 105), '0% - 100%');
});

test('[F7-B4] Non-numeric rate input error validation', () => {
  const validateRateConfig = (config) => {
    const fields = ['koreaRate', 'usdRate', 'jpyRate', 'serviceFeePercent'];
    for (const field of fields) {
      const rawVal = config[field];
      if (rawVal === null || rawVal === undefined) {
        throw new Error(`Trường ${field} phải là một số hợp lệ!`);
      }
      const val = Number(rawVal);
      if (isNaN(val)) {
        throw new Error(`Trường ${field} phải là một số hợp lệ!`);
      }
    }
    return true;
  };

  assertThrows(() => validateRateConfig({ koreaRate: 'abc', usdRate: 25000, jpyRate: 160, serviceFeePercent: 5 }), 'phải là một số');
  assertThrows(() => validateRateConfig({ koreaRate: 19.5, usdRate: null, jpyRate: 160, serviceFeePercent: 5 }), 'phải là một số');
  assertEquals(validateRateConfig({ koreaRate: 19.5, usdRate: 25000, jpyRate: 160, serviceFeePercent: 5 }), true, 'Valid numeric config passes');
});

test('[F7-B5] Invalid currency code configuration handling', () => {
  const SUPPORTED_CURRENCIES = ['KRW', 'USD', 'JPY'];

  const getCurrencyRate = (ratesObj, currencyCode) => {
    const code = (currencyCode || '').toUpperCase().trim();
    if (!SUPPORTED_CURRENCIES.includes(code)) {
      throw new Error(`Mã tiền tệ ${currencyCode} không được hỗ trợ!`);
    }
    return ratesObj[code] || 1.0;
  };

  const rates = { KRW: 19.5, USD: 25400, JPY: 165 };
  assertThrows(() => getCurrencyRate(rates, 'EUR'), 'không được hỗ trợ');
  assertThrows(() => getCurrencyRate(rates, 'XYZ'), 'không được hỗ trợ');
  assertEquals(getCurrencyRate(rates, 'KRW'), 19.5, 'KRW rate returned correctly');
});
