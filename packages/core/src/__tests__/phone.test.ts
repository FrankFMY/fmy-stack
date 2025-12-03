/**
 * @fileoverview Tests for phone utilities
 */

import { describe, expect, test } from 'bun:test';
import {
	cleanPhone,
	formatPhoneRU,
	formatPhoneCompact,
	parsePhone,
	validatePhoneRU,
	getOperator,
	createPhoneLink,
	createWhatsAppLink,
	createTelegramLink,
	maskPhoneNumber
} from '../phone/index.js';

describe('cleanPhone', () => {
	test('should clean formatted phone', () => {
		expect(cleanPhone('+7 (999) 123-45-67')).toBe('+79991234567');
	});

	test('should convert 8 to +7', () => {
		expect(cleanPhone('89991234567')).toBe('+79991234567');
	});

	test('should add +7 to 10-digit number', () => {
		expect(cleanPhone('9991234567')).toBe('+79991234567');
	});

	test('should handle already clean phone', () => {
		expect(cleanPhone('+79991234567')).toBe('+79991234567');
	});
});

describe('formatPhoneRU', () => {
	test('should format to Russian style', () => {
		expect(formatPhoneRU('+79991234567')).toBe('+7 (999) 123-45-67');
	});

	test('should handle 8 prefix', () => {
		expect(formatPhoneRU('89991234567')).toBe('+7 (999) 123-45-67');
	});

	test('should handle 10-digit number', () => {
		expect(formatPhoneRU('9991234567')).toBe('+7 (999) 123-45-67');
	});

	test('should return original for invalid format', () => {
		expect(formatPhoneRU('12345')).toBe('12345');
	});
});

describe('formatPhoneCompact', () => {
	test('should format to compact style', () => {
		expect(formatPhoneCompact('+79991234567')).toBe('+7 999 123-45-67');
	});

	test('should handle 8 prefix', () => {
		expect(formatPhoneCompact('89991234567')).toBe('+7 999 123-45-67');
	});
});

describe('parsePhone', () => {
	test('should parse valid Russian phone', () => {
		const result = parsePhone('+79991234567');
		expect(result.country).toBe('+7');
		expect(result.area).toBe('999');
		expect(result.number).toBe('1234567');
		expect(result.isValid).toBe(true);
	});

	test('should parse 10-digit phone', () => {
		const result = parsePhone('9991234567');
		expect(result.isValid).toBe(true);
		expect(result.area).toBe('999');
	});

	test('should handle invalid phone', () => {
		const result = parsePhone('12345');
		expect(result.isValid).toBe(false);
	});
});

describe('validatePhoneRU', () => {
	test('should validate correct Russian mobile', () => {
		expect(validatePhoneRU('+79991234567')).toBe(true);
		expect(validatePhoneRU('89991234567')).toBe(true);
		expect(validatePhoneRU('9991234567')).toBe(true);
	});

	test('should reject landline numbers', () => {
		expect(validatePhoneRU('+74951234567')).toBe(false);
	});

	test('should reject invalid numbers', () => {
		expect(validatePhoneRU('invalid')).toBe(false);
		expect(validatePhoneRU('12345')).toBe(false);
	});
});

describe('getOperator', () => {
	test('should detect MTS', () => {
		expect(getOperator('+79101234567')).toBe('МТС');
		expect(getOperator('9851234567')).toBe('МТС');
	});

	test('should detect Beeline', () => {
		expect(getOperator('+79031234567')).toBe('Билайн');
		expect(getOperator('9651234567')).toBe('Билайн');
	});

	test('should detect MegaFon', () => {
		expect(getOperator('+79201234567')).toBe('МегаФон');
	});

	test('should detect Tele2', () => {
		expect(getOperator('+79001234567')).toBe('Теле2');
	});

	test('should return null for unknown code', () => {
		expect(getOperator('+79401234567')).toBeNull();
	});

	test('should return null for invalid number', () => {
		expect(getOperator('12345')).toBeNull();
	});
});

describe('createPhoneLink', () => {
	test('should create tel: link', () => {
		expect(createPhoneLink('+79991234567')).toBe('tel:+79991234567');
	});

	test('should clean phone before creating link', () => {
		expect(createPhoneLink('8 (999) 123-45-67')).toBe('tel:+79991234567');
	});
});

describe('createWhatsAppLink', () => {
	test('should create WhatsApp link', () => {
		expect(createWhatsAppLink('+79991234567')).toBe('https://wa.me/79991234567');
	});

	test('should include message if provided', () => {
		expect(createWhatsAppLink('+79991234567', 'Hello!')).toBe(
			'https://wa.me/79991234567?text=Hello!'
		);
	});

	test('should encode message', () => {
		expect(createWhatsAppLink('+79991234567', 'Hello World!')).toBe(
			'https://wa.me/79991234567?text=Hello%20World!'
		);
	});
});

describe('createTelegramLink', () => {
	test('should create Telegram link', () => {
		expect(createTelegramLink('+79991234567')).toBe('https://t.me/+79991234567');
	});
});

describe('maskPhoneNumber', () => {
	test('should mask phone number', () => {
		expect(maskPhoneNumber('+79991234567')).toBe('+7 (***) ***-45-67');
	});

	test('should handle 8 prefix', () => {
		expect(maskPhoneNumber('89991234567')).toBe('+7 (***) ***-45-67');
	});

	test('should return original for invalid format', () => {
		expect(maskPhoneNumber('12345')).toBe('12345');
	});
});
