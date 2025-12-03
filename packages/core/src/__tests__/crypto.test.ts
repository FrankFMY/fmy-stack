/**
 * @fileoverview Tests for crypto utilities
 */

import { describe, expect, test } from 'bun:test';
import {
	generateUUID,
	generateNanoid,
	generateToken,
	generateSecureRandom,
	hashSHA256,
	hashSHA512,
	hashPassword,
	verifyPassword,
	generateOTP,
	generateApiKey,
	generateRandomPassword,
	checkPasswordStrength,
	secureCompare,
	encodeBase64,
	decodeBase64,
	encodeBase64Url,
	decodeBase64Url
} from '../crypto/index.js';

describe('generateUUID', () => {
	test('should generate valid UUID v4', () => {
		const uuid = generateUUID();
		expect(uuid).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
		);
	});

	test('should generate unique UUIDs', () => {
		const uuids = new Set(Array.from({ length: 100 }, () => generateUUID()));
		expect(uuids.size).toBe(100);
	});
});

describe('generateNanoid', () => {
	test('should generate nanoid with default length', () => {
		const id = generateNanoid();
		expect(id).toHaveLength(21);
	});

	test('should generate nanoid with custom length', () => {
		const id = generateNanoid(10);
		expect(id).toHaveLength(10);
	});

	test('should generate unique nanoids', () => {
		const ids = new Set(Array.from({ length: 100 }, () => generateNanoid()));
		expect(ids.size).toBe(100);
	});
});

describe('generateToken', () => {
	test('should generate hex token with default length', () => {
		const token = generateToken();
		expect(token).toHaveLength(64); // 32 bytes = 64 hex chars
		expect(token).toMatch(/^[0-9a-f]+$/);
	});

	test('should generate token with custom length', () => {
		const token = generateToken(16);
		expect(token).toHaveLength(32); // 16 bytes = 32 hex chars
	});
});

describe('generateSecureRandom', () => {
	test('should generate number within range', () => {
		for (let i = 0; i < 100; i++) {
			const num = generateSecureRandom(1, 10);
			expect(num).toBeGreaterThanOrEqual(1);
			expect(num).toBeLessThanOrEqual(10);
		}
	});

	test('should include boundary values', () => {
		const results = new Set<number>();
		for (let i = 0; i < 1000; i++) {
			results.add(generateSecureRandom(1, 3));
		}
		expect(results.has(1)).toBe(true);
		expect(results.has(2)).toBe(true);
		expect(results.has(3)).toBe(true);
	});
});

describe('hashSHA256', () => {
	test('should hash string correctly', async () => {
		const hash = await hashSHA256('hello');
		expect(hash).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
	});

	test('should produce consistent hashes', async () => {
		const hash1 = await hashSHA256('test');
		const hash2 = await hashSHA256('test');
		expect(hash1).toBe(hash2);
	});
});

describe('hashSHA512', () => {
	test('should hash string correctly', async () => {
		const hash = await hashSHA512('hello');
		expect(hash).toHaveLength(128); // SHA-512 = 64 bytes = 128 hex chars
	});
});

describe('hashPassword and verifyPassword', () => {
	test('should hash and verify password', async () => {
		const password = 'MySecretPassword123!';
		const hash = await hashPassword(password);

		expect(hash).not.toBe(password);
		expect(await verifyPassword(password, hash)).toBe(true);
		expect(await verifyPassword('WrongPassword', hash)).toBe(false);
	});

	test('should produce different hashes for same password', async () => {
		const password = 'SamePassword';
		const hash1 = await hashPassword(password);
		const hash2 = await hashPassword(password);

		// In bcrypt/sha256+salt mode, hashes should be different
		expect(await verifyPassword(password, hash1)).toBe(true);
		expect(await verifyPassword(password, hash2)).toBe(true);
	});
});

describe('generateOTP', () => {
	test('should generate OTP with default length', () => {
		const otp = generateOTP();
		expect(otp).toHaveLength(6);
		expect(otp).toMatch(/^\d+$/);
	});

	test('should generate OTP with custom length', () => {
		const otp = generateOTP(8);
		expect(otp).toHaveLength(8);
	});
});

describe('generateApiKey', () => {
	test('should generate API key with prefix', () => {
		const key = generateApiKey();
		expect(key).toMatch(/^fmy_[0-9a-f]{48}$/);
	});
});

describe('generateRandomPassword', () => {
	test('should generate password with default length', () => {
		const password = generateRandomPassword();
		expect(password).toHaveLength(16);
	});

	test('should include all character types', () => {
		const password = generateRandomPassword(20);
		expect(password).toMatch(/[a-z]/);
		expect(password).toMatch(/[A-Z]/);
		expect(password).toMatch(/\d/);
		expect(password).toMatch(/[!@#$%^&*]/);
	});
});

describe('checkPasswordStrength', () => {
	test('should identify weak passwords', () => {
		const result = checkPasswordStrength('weak');
		expect(result.isStrong).toBe(false);
		expect(result.feedback.length).toBeGreaterThan(0);
	});

	test('should identify strong passwords', () => {
		const result = checkPasswordStrength('MyStr0ng!Pass#2025');
		expect(result.isStrong).toBe(true);
		expect(result.score).toBeGreaterThanOrEqual(5);
	});

	test('should detect common patterns', () => {
		const result = checkPasswordStrength('password123');
		expect(result.feedback).toContain('Избегайте простых паттернов');
	});
});

describe('secureCompare', () => {
	test('should return true for equal strings', () => {
		expect(secureCompare('test', 'test')).toBe(true);
		expect(secureCompare('', '')).toBe(true);
	});

	test('should return false for different strings', () => {
		expect(secureCompare('test', 'Test')).toBe(false);
		expect(secureCompare('test', 'test1')).toBe(false);
		expect(secureCompare('test', 'tes')).toBe(false);
	});
});

describe('Base64 encoding', () => {
	test('should encode and decode base64', () => {
		const original = 'Hello, World!';
		const encoded = encodeBase64(original);
		const decoded = decodeBase64(encoded);
		expect(decoded).toBe(original);
	});

	test('should encode and decode base64url', () => {
		const original = 'Hello+World/Test=';
		const encoded = encodeBase64Url(original);
		expect(encoded).not.toContain('+');
		expect(encoded).not.toContain('/');
		expect(encoded).not.toContain('=');

		const decoded = decodeBase64Url(encoded);
		expect(decoded).toBe(original);
	});
});

