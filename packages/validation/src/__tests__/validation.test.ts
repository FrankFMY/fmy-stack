/**
 * @fileoverview Tests for validation schemas
 */

import { describe, expect, test } from 'bun:test';
import { type } from 'arktype';
import {
	EmailSchema,
	UrlSchema,
	UuidSchema,
	NonEmptyStringSchema,
	PhoneRUSchema,
	INNSchema,
	INN10Schema,
	INN12Schema,
	OGRNSchema,
	KPPSchema,
	SNILSSchema,
	BIKSchema,
	MoneySchema,
	PositiveMoneySchema,
	PercentSchema,
	PasswordStrongSchema,
	PasswordSimpleSchema,
	UsernameSchema,
	UserCreateSchema,
	UserLoginSchema,
	PaginationSchema,
	validate,
	validateOrThrow
} from '../index.js';

describe('EmailSchema', () => {
	test('should validate correct emails', () => {
		expect(EmailSchema('user@example.com')).toBe('user@example.com');
		expect(EmailSchema('test.user+tag@domain.co.uk')).toBe('test.user+tag@domain.co.uk');
	});

	test('should reject invalid emails', () => {
		expect(EmailSchema('invalid')).toBeInstanceOf(type.errors);
		expect(EmailSchema('invalid@')).toBeInstanceOf(type.errors);
		expect(EmailSchema('@domain.com')).toBeInstanceOf(type.errors);
	});
});

describe('UrlSchema', () => {
	test('should validate correct URLs', () => {
		expect(UrlSchema('https://example.com')).toBe('https://example.com');
		expect(UrlSchema('http://localhost:3000/path')).toBe('http://localhost:3000/path');
	});

	test('should reject invalid URLs', () => {
		expect(UrlSchema('not-a-url')).toBeInstanceOf(type.errors);
	});
});

describe('UuidSchema', () => {
	test('should validate UUID v4', () => {
		expect(UuidSchema('550e8400-e29b-41d4-a716-446655440000')).toBe(
			'550e8400-e29b-41d4-a716-446655440000'
		);
	});

	test('should reject invalid UUIDs', () => {
		expect(UuidSchema('not-a-uuid')).toBeInstanceOf(type.errors);
	});
});

describe('NonEmptyStringSchema', () => {
	test('should validate non-empty strings', () => {
		expect(NonEmptyStringSchema('hello')).toBe('hello');
		expect(NonEmptyStringSchema('a')).toBe('a');
	});

	test('should reject empty strings', () => {
		expect(NonEmptyStringSchema('')).toBeInstanceOf(type.errors);
	});
});

describe('PhoneRUSchema', () => {
	test('should validate Russian phone numbers', () => {
		expect(PhoneRUSchema('+79161234567')).toBe('+79161234567');
		expect(PhoneRUSchema('89161234567')).toBe('89161234567');
		expect(PhoneRUSchema('9161234567')).toBe('9161234567');
	});

	test('should reject invalid phones', () => {
		expect(PhoneRUSchema('12345')).toBeInstanceOf(type.errors);
		expect(PhoneRUSchema('+11234567890')).toBeInstanceOf(type.errors);
	});
});

describe('INNSchema', () => {
	test('should validate INN-10', () => {
		expect(INN10Schema('7707083893')).toBe('7707083893');
	});

	test('should validate INN-12', () => {
		expect(INN12Schema('500100732259')).toBe('500100732259');
	});

	test('should validate any valid INN', () => {
		expect(INNSchema('7707083893')).toBe('7707083893');
		expect(INNSchema('500100732259')).toBe('500100732259');
	});

	test('should reject invalid INN', () => {
		expect(INNSchema('1234567890')).toBeInstanceOf(type.errors);
		expect(INNSchema('123')).toBeInstanceOf(type.errors);
	});
});

describe('OGRNSchema', () => {
	test('should validate OGRN-13', () => {
		expect(OGRNSchema('1027700132195')).toBe('1027700132195');
	});

	test('should validate OGRNIP-15', () => {
		expect(OGRNSchema('304500116000157')).toBe('304500116000157');
	});

	test('should reject invalid OGRN', () => {
		expect(OGRNSchema('1234567890123')).toBeInstanceOf(type.errors);
	});
});

describe('KPPSchema', () => {
	test('should validate correct KPP', () => {
		expect(KPPSchema('773601001')).toBe('773601001');
	});

	test('should reject invalid KPP', () => {
		expect(KPPSchema('12345678')).toBeInstanceOf(type.errors);
	});
});

describe('SNILSSchema', () => {
	test('should validate correct SNILS', () => {
		expect(SNILSSchema('11223344595')).toBe('11223344595');
	});

	test('should reject invalid SNILS', () => {
		expect(SNILSSchema('1234567890')).toBeInstanceOf(type.errors);
	});
});

describe('BIKSchema', () => {
	test('should validate correct BIK', () => {
		expect(BIKSchema('044525225')).toBe('044525225');
	});

	test('should reject invalid BIK', () => {
		expect(BIKSchema('12345678')).toBeInstanceOf(type.errors);
	});
});

describe('MoneySchema', () => {
	test('should validate non-negative numbers', () => {
		expect(MoneySchema(0)).toBe(0);
		expect(MoneySchema(100.5)).toBe(100.5);
	});

	test('should reject negative numbers', () => {
		expect(MoneySchema(-1)).toBeInstanceOf(type.errors);
	});
});

describe('PositiveMoneySchema', () => {
	test('should validate positive numbers', () => {
		expect(PositiveMoneySchema(0.01)).toBe(0.01);
		expect(PositiveMoneySchema(100)).toBe(100);
	});

	test('should reject zero and negative', () => {
		expect(PositiveMoneySchema(0)).toBeInstanceOf(type.errors);
		expect(PositiveMoneySchema(-1)).toBeInstanceOf(type.errors);
	});
});

describe('PercentSchema', () => {
	test('should validate 0-100 range', () => {
		expect(PercentSchema(0)).toBe(0);
		expect(PercentSchema(50)).toBe(50);
		expect(PercentSchema(100)).toBe(100);
	});

	test('should reject out of range', () => {
		expect(PercentSchema(-1)).toBeInstanceOf(type.errors);
		expect(PercentSchema(101)).toBeInstanceOf(type.errors);
	});
});

describe('PasswordStrongSchema', () => {
	test('should validate strong passwords', () => {
		const password = 'MyStr0ng!Pass';
		expect(PasswordStrongSchema(password)).toBe(password);
	});

	test('should reject weak passwords', () => {
		expect(PasswordStrongSchema('weak')).toBeInstanceOf(type.errors);
		expect(PasswordStrongSchema('alllowercase')).toBeInstanceOf(type.errors);
		expect(PasswordStrongSchema('ALLUPPERCASE')).toBeInstanceOf(type.errors);
		expect(PasswordStrongSchema('NoSpecial1')).toBeInstanceOf(type.errors);
	});
});

describe('PasswordSimpleSchema', () => {
	test('should validate 6+ char passwords', () => {
		expect(PasswordSimpleSchema('123456')).toBe('123456');
	});

	test('should reject short passwords', () => {
		expect(PasswordSimpleSchema('12345')).toBeInstanceOf(type.errors);
	});
});

describe('UsernameSchema', () => {
	test('should validate usernames', () => {
		expect(UsernameSchema('user123')).toBe('user123');
		expect(UsernameSchema('user_name')).toBe('user_name');
	});

	test('should reject invalid usernames', () => {
		expect(UsernameSchema('a')).toBeInstanceOf(type.errors); // too short
		expect(UsernameSchema('user@name')).toBeInstanceOf(type.errors); // invalid char
	});
});

describe('UserCreateSchema', () => {
	test('should validate user creation data', () => {
		const data = {
			email: 'user@example.com',
			name: 'John Doe',
			password: 'MyStr0ng!Pass'
		};
		const result = UserCreateSchema(data);
		expect(result).toEqual(data);
	});

	test('should allow optional phone', () => {
		const data = {
			email: 'user@example.com',
			name: 'John Doe',
			phone: '+79161234567',
			password: 'MyStr0ng!Pass'
		};
		const result = UserCreateSchema(data);
		expect(result).toEqual(data);
	});

	test('should reject invalid data', () => {
		const data = {
			email: 'invalid',
			name: 'J',
			password: 'weak'
		};
		expect(UserCreateSchema(data)).toBeInstanceOf(type.errors);
	});
});

describe('UserLoginSchema', () => {
	test('should validate login data', () => {
		const data = {
			email: 'user@example.com',
			password: 'anypassword'
		};
		expect(UserLoginSchema(data)).toEqual(data);
	});
});

describe('PaginationSchema', () => {
	test('should validate pagination params', () => {
		const data = { page: 1, limit: 20, sortBy: 'name', sortOrder: 'asc' as const };
		expect(PaginationSchema(data)).toEqual(data);
	});

	test('should allow partial params', () => {
		expect(PaginationSchema({})).toEqual({});
		expect(PaginationSchema({ page: 2 })).toEqual({ page: 2 });
	});

	test('should reject invalid values', () => {
		expect(PaginationSchema({ page: 0 })).toBeInstanceOf(type.errors);
		expect(PaginationSchema({ page: -1 })).toBeInstanceOf(type.errors);
	});
});

describe('validate utility', () => {
	test('should return success result for valid data', () => {
		const result = validate(EmailSchema, 'user@example.com');
		expect(result.success).toBe(true);
		expect(result.data).toBe('user@example.com');
	});

	test('should return error result for invalid data', () => {
		const result = validate(EmailSchema, 'invalid');
		expect(result.success).toBe(false);
		expect(result.errors).toBeDefined();
		expect(result.errors!.length).toBeGreaterThan(0);
	});
});

describe('validateOrThrow utility', () => {
	test('should return data for valid input', () => {
		const result = validateOrThrow(EmailSchema, 'user@example.com');
		expect(result).toBe('user@example.com');
	});

	test('should throw for invalid input', () => {
		expect(() => validateOrThrow(EmailSchema, 'invalid')).toThrow();
	});
});
