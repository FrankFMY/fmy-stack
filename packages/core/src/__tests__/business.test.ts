/**
 * @fileoverview Tests for Russian business identifiers validation
 */

import { describe, expect, test } from 'bun:test';
import {
	validateINN,
	validateOGRN,
	validateKPP,
	validateSNILS,
	validateBIK,
	validateAccount,
	getINNType,
	getOGRNType,
	generateINN10,
	generateINN12
} from '../business/index.js';

describe('validateINN', () => {
	test('should validate correct INN-10 (legal entity)', () => {
		expect(validateINN('7707083893')).toBe(true); // Сбербанк
		expect(validateINN('7736207543')).toBe(true); // Яндекс
	});

	test('should validate correct INN-12 (individual)', () => {
		expect(validateINN('500100732259')).toBe(true);
		// Генерируем и проверяем случайный ИНН-12
		const generatedINN = generateINN12();
		expect(validateINN(generatedINN)).toBe(true);
	});

	test('should reject invalid INN', () => {
		expect(validateINN('7707083890')).toBe(false); // Wrong checksum
		expect(validateINN('123456789')).toBe(false); // Wrong length
		expect(validateINN('77070838930')).toBe(false); // 11 digits
		expect(validateINN('abcdefghij')).toBe(false); // Letters
	});

	test('should handle INN with spaces/dashes', () => {
		expect(validateINN('7707 0838 93')).toBe(true);
		expect(validateINN('7707-0838-93')).toBe(true);
	});
});

describe('validateOGRN', () => {
	test('should validate correct OGRN-13 (legal entity)', () => {
		expect(validateOGRN('1027700132195')).toBe(true); // Сбербанк
		expect(validateOGRN('1027739850962')).toBe(true);
	});

	test('should validate correct OGRNIP-15 (individual entrepreneur)', () => {
		expect(validateOGRN('304500116000157')).toBe(true);
	});

	test('should reject invalid OGRN', () => {
		expect(validateOGRN('1027700132190')).toBe(false); // Wrong checksum
		expect(validateOGRN('12345678901234')).toBe(false); // 14 digits
	});
});

describe('validateKPP', () => {
	test('should validate correct KPP', () => {
		expect(validateKPP('773601001')).toBe(true);
		expect(validateKPP('770301001')).toBe(true);
	});

	test('should reject invalid KPP', () => {
		expect(validateKPP('12345678')).toBe(false); // 8 digits
		expect(validateKPP('0036010001')).toBe(false); // 10 digits
		expect(validateKPP('003601001')).toBe(false); // Invalid region code
	});
});

describe('validateSNILS', () => {
	test('should validate correct SNILS', () => {
		expect(validateSNILS('112-233-445 95')).toBe(true);
		expect(validateSNILS('11223344595')).toBe(true);
	});

	test('should accept low SNILS numbers without checksum validation', () => {
		expect(validateSNILS('001-001-998 00')).toBe(true);
	});

	test('should reject invalid SNILS', () => {
		expect(validateSNILS('1234567890')).toBe(false); // 10 digits
		expect(validateSNILS('112-233-445 00')).toBe(false); // Wrong checksum
	});
});

describe('validateBIK', () => {
	test('should validate correct BIK', () => {
		expect(validateBIK('044525225')).toBe(true); // Сбербанк
		expect(validateBIK('044525593')).toBe(true);
	});

	test('should reject invalid BIK', () => {
		expect(validateBIK('12345678')).toBe(false); // 8 digits
		expect(validateBIK('144525225')).toBe(false); // Doesn't start with 04
	});
});

describe('validateAccount', () => {
	test('should validate account number format', () => {
		// Проверяем что функция корректно отвергает неправильный формат
		expect(validateAccount('1234567890123456789', '044525225')).toBe(false); // 19 digits
		expect(validateAccount('12345678901234567890', '04452522')).toBe(false); // 8 digit BIK
	});

	test('should reject accounts with wrong length', () => {
		expect(validateAccount('123456789012345678', '044525225')).toBe(false); // 18 digits
		expect(validateAccount('12345678901234567890123', '044525225')).toBe(false); // 23 digits
	});
});

describe('getINNType', () => {
	test('should detect legal entity INN', () => {
		expect(getINNType('7707083893')).toBe('legal');
	});

	test('should detect individual INN', () => {
		expect(getINNType('500100732259')).toBe('individual');
	});

	test('should return unknown for invalid INN', () => {
		expect(getINNType('123')).toBe('unknown');
	});
});

describe('getOGRNType', () => {
	test('should detect legal entity OGRN', () => {
		expect(getOGRNType('1027700132195')).toBe('legal');
	});

	test('should detect individual OGRNIP', () => {
		expect(getOGRNType('304500116000157')).toBe('individual');
	});

	test('should return unknown for invalid OGRN', () => {
		expect(getOGRNType('123')).toBe('unknown');
	});
});

describe('generateINN10', () => {
	test('should generate valid INN-10', () => {
		for (let i = 0; i < 10; i++) {
			const inn = generateINN10();
			expect(inn).toHaveLength(10);
			expect(validateINN(inn)).toBe(true);
		}
	});
});

describe('generateINN12', () => {
	test('should generate valid INN-12', () => {
		for (let i = 0; i < 10; i++) {
			const inn = generateINN12();
			expect(inn).toHaveLength(12);
			expect(validateINN(inn)).toBe(true);
		}
	});
});

