/**
 * @fileoverview Tests for money utilities
 */

import { describe, expect, test } from 'bun:test';
import {
	Currency,
	VATRate,
	formatMoney,
	formatMoneyRU,
	formatMoneyShort,
	parseMoney,
	roundMoney,
	calcVAT,
	addVAT,
	calcDiscount,
	calcDiscountPercent,
	formatCreditCard,
	formatCreditCardFull,
	validateIBAN
} from '../money/index.js';

describe('formatMoney', () => {
	test('should format with default currency (RUB)', () => {
		expect(formatMoney(1234.56)).toBe('1 234.56 ₽');
	});

	test('should format with USD currency', () => {
		expect(formatMoney(1234.56, 'USD')).toBe('1 234.56 $');
	});

	test('should format with EUR currency', () => {
		expect(formatMoney(1234.56, 'EUR')).toBe('1 234.56 €');
	});

	test('should format large numbers', () => {
		expect(formatMoney(1234567.89)).toBe('1 234 567.89 ₽');
	});
});

describe('formatMoneyRU', () => {
	test('should format in Russian style with comma', () => {
		expect(formatMoneyRU(1234567.89)).toBe('1 234 567,89 ₽');
	});

	test('should format small numbers', () => {
		expect(formatMoneyRU(99.99)).toBe('99,99 ₽');
	});
});

describe('formatMoneyShort', () => {
	test('should format billions', () => {
		expect(formatMoneyShort(1500000000)).toBe('1.5B ₽');
	});

	test('should format millions', () => {
		expect(formatMoneyShort(1500000)).toBe('1.5M ₽');
	});

	test('should format thousands', () => {
		expect(formatMoneyShort(1500)).toBe('1.5K ₽');
	});

	test('should not shorten small numbers', () => {
		expect(formatMoneyShort(999)).toBe('999 ₽');
	});

	test('should work with other currencies', () => {
		expect(formatMoneyShort(1500000, 'USD')).toBe('1.5M $');
	});
});

describe('parseMoney', () => {
	test('should parse Russian format (comma decimal)', () => {
		expect(parseMoney('1 234,56 ₽')).toBe(1234.56);
	});

	test('should parse US format (dot decimal)', () => {
		expect(parseMoney('$1,234.56')).toBe(1234.56);
	});

	test('should return 0 for invalid input', () => {
		expect(parseMoney('invalid')).toBe(0);
	});

	test('should handle plain numbers', () => {
		expect(parseMoney('1234.56')).toBe(1234.56);
	});
});

describe('roundMoney', () => {
	test('should round to 2 decimal places', () => {
		expect(roundMoney(1.234)).toBe(1.23);
		expect(roundMoney(1.235)).toBe(1.24);
		expect(roundMoney(1.999)).toBe(2);
	});
});

describe('calcVAT', () => {
	test('should calculate VAT from gross amount', () => {
		const result = calcVAT(1200, 20);
		expect(result.gross).toBe(1200);
		expect(result.net).toBe(1000);
		expect(result.vat).toBe(200);
	});

	test('should use default VAT rate (20%)', () => {
		const result = calcVAT(1200);
		expect(result.vat).toBe(200);
	});

	test('should handle reduced VAT rate', () => {
		const result = calcVAT(1100, VATRate.REDUCED);
		expect(result.net).toBe(1000);
		expect(result.vat).toBe(100);
	});
});

describe('addVAT', () => {
	test('should add VAT to net amount', () => {
		const result = addVAT(1000, 20);
		expect(result.net).toBe(1000);
		expect(result.vat).toBe(200);
		expect(result.gross).toBe(1200);
	});

	test('should use default VAT rate (20%)', () => {
		const result = addVAT(1000);
		expect(result.gross).toBe(1200);
	});
});

describe('calcDiscount', () => {
	test('should calculate discount', () => {
		const result = calcDiscount(1000, 15);
		expect(result.original).toBe(1000);
		expect(result.discount).toBe(150);
		expect(result.final).toBe(850);
	});

	test('should handle 0% discount', () => {
		const result = calcDiscount(1000, 0);
		expect(result.final).toBe(1000);
	});

	test('should handle 100% discount', () => {
		const result = calcDiscount(1000, 100);
		expect(result.final).toBe(0);
	});
});

describe('calcDiscountPercent', () => {
	test('should calculate discount percentage', () => {
		expect(calcDiscountPercent(1000, 850)).toBe(15);
		expect(calcDiscountPercent(200, 180)).toBe(10);
	});

	test('should return 0 for zero original price', () => {
		expect(calcDiscountPercent(0, 100)).toBe(0);
	});
});

describe('formatCreditCard', () => {
	test('should mask card number showing only last 4 digits', () => {
		expect(formatCreditCard('4111111111111111')).toBe('•••• 1111');
	});

	test('should handle card with spaces', () => {
		expect(formatCreditCard('4111 1111 1111 1111')).toBe('•••• 1111');
	});

	test('should handle short input', () => {
		expect(formatCreditCard('123')).toBe('••••');
	});
});

describe('formatCreditCardFull', () => {
	test('should format full card number with spaces', () => {
		expect(formatCreditCardFull('4111111111111111')).toBe('4111 1111 1111 1111');
	});

	test('should clean existing formatting', () => {
		expect(formatCreditCardFull('4111-1111-1111-1111')).toBe('4111 1111 1111 1111');
	});
});

describe('validateIBAN', () => {
	test('should validate correct IBAN', () => {
		expect(validateIBAN('GB29 NWBK 6016 1331 9268 19')).toBe(true);
		expect(validateIBAN('DE89370400440532013000')).toBe(true);
	});

	test('should reject invalid IBAN', () => {
		expect(validateIBAN('GB29 NWBK 6016 1331 9268 20')).toBe(false);
		expect(validateIBAN('INVALID')).toBe(false);
	});

	test('should reject too short IBAN', () => {
		expect(validateIBAN('GB29 NWBK')).toBe(false);
	});
});

describe('Currency and VATRate constants', () => {
	test('should have Currency values', () => {
		expect(Currency.RUB).toBe('RUB');
		expect(Currency.USD).toBe('USD');
		expect(Currency.EUR).toBe('EUR');
	});

	test('should have VATRate values', () => {
		expect(VATRate.STANDARD).toBe(20);
		expect(VATRate.REDUCED).toBe(10);
		expect(VATRate.ZERO).toBe(0);
	});
});
