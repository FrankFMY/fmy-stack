/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * Утилиты для криптографии и генерации токенов
 */

import { nanoid } from 'nanoid';

/**
 * Генерировать UUID v4
 */
export function generateUUID(): string {
	return crypto.randomUUID();
}

/**
 * Генерировать nanoid
 * @param length Длина строки (по умолчанию 21)
 */
export function generateNanoid(length = 21): string {
	return nanoid(length);
}

/**
 * Генерировать криптографически безопасный токен
 * @param length Количество байт (по умолчанию 32)
 */
export function generateToken(length = 32): string {
	const bytes = new Uint8Array(length);
	crypto.getRandomValues(bytes);
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

/**
 * Генерировать случайное число в диапазоне
 */
export function generateSecureRandom(min: number, max: number): number {
	const range = max - min + 1;
	const bytes = new Uint32Array(1);
	crypto.getRandomValues(bytes);
	return min + (bytes[0]! % range);
}

/**
 * Хэшировать строку с помощью SHA-256
 */
export async function hashSHA256(text: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(text);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Хэшировать строку с помощью SHA-512
 */
export async function hashSHA512(text: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(text);
	const hashBuffer = await crypto.subtle.digest('SHA-512', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Хэшировать пароль с использованием Bun.password (bcrypt)
 * Эта функция работает только в среде Bun
 */
export async function hashPassword(password: string): Promise<string> {
	// Используем Bun.password для bcrypt хэширования
	if (typeof Bun !== 'undefined' && Bun.password) {
		return await Bun.password.hash(password, {
			algorithm: 'bcrypt',
			cost: 12
		});
	}

	// Fallback: используем SHA-256 с солью (менее безопасно, но работает везде)
	const salt = generateToken(16);
	const hash = await hashSHA256(salt + password);
	return `$sha256$${salt}$${hash}`;
}

/**
 * Проверить пароль против хэша
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	// Используем Bun.password для проверки bcrypt
	if (typeof Bun !== 'undefined' && Bun.password) {
		return await Bun.password.verify(password, hash);
	}

	// Fallback: проверка SHA-256 хэша
	if (hash.startsWith('$sha256$')) {
		const parts = hash.split('$');
		if (parts.length !== 4) return false;
		const salt = parts[2]!;
		const storedHash = parts[3]!;
		const computedHash = await hashSHA256(salt + password);
		return storedHash === computedHash;
	}

	return false;
}

/**
 * Генерировать OTP код (одноразовый пароль)
 * @param length Длина кода (по умолчанию 6)
 */
export function generateOTP(length = 6): string {
	const digits = '0123456789';
	let otp = '';
	for (let i = 0; i < length; i++) {
		otp += digits[generateSecureRandom(0, 9)];
	}
	return otp;
}

/**
 * Генерировать API ключ
 */
export function generateApiKey(): string {
	const prefix = 'fmy';
	const token = generateToken(24);
	return `${prefix}_${token}`;
}

/**
 * Генерировать случайную строку для пароля
 */
export function generateRandomPassword(length = 16): string {
	const lowercase = 'abcdefghijklmnopqrstuvwxyz';
	const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const numbers = '0123456789';
	const special = '!@#$%^&*';
	const all = lowercase + uppercase + numbers + special;

	// Гарантируем наличие хотя бы одного символа каждого типа
	let password = '';
	password += lowercase[generateSecureRandom(0, lowercase.length - 1)];
	password += uppercase[generateSecureRandom(0, uppercase.length - 1)];
	password += numbers[generateSecureRandom(0, numbers.length - 1)];
	password += special[generateSecureRandom(0, special.length - 1)];

	// Заполняем оставшуюся длину случайными символами
	for (let i = password.length; i < length; i++) {
		password += all[generateSecureRandom(0, all.length - 1)];
	}

	// Перемешиваем символы
	return shuffleString(password);
}

/**
 * Проверить сложность пароля
 */
export function checkPasswordStrength(password: string): {
	score: number;
	feedback: string[];
	isStrong: boolean;
} {
	const feedback: string[] = [];
	let score = 0;

	// Длина
	if (password.length >= 8) score += 1;
	if (password.length >= 12) score += 1;
	if (password.length >= 16) score += 1;
	if (password.length < 8) feedback.push('Минимум 8 символов');

	// Строчные буквы
	if (/[a-z]/.test(password)) {
		score += 1;
	} else {
		feedback.push('Добавьте строчные буквы');
	}

	// Заглавные буквы
	if (/[A-Z]/.test(password)) {
		score += 1;
	} else {
		feedback.push('Добавьте заглавные буквы');
	}

	// Цифры
	if (/\d/.test(password)) {
		score += 1;
	} else {
		feedback.push('Добавьте цифры');
	}

	// Специальные символы
	if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
		score += 1;
	} else {
		feedback.push('Добавьте специальные символы');
	}

	// Проверка на распространенные паттерны
	if (/(.)\1{2,}/.test(password)) {
		score -= 1;
		feedback.push('Избегайте повторяющихся символов');
	}

	if (/^(?:123|abc|qwerty|password)/i.test(password)) {
		score -= 2;
		feedback.push('Избегайте простых паттернов');
	}

	return {
		score: Math.max(0, Math.min(score, 7)),
		feedback,
		isStrong: score >= 5
	};
}

/**
 * Безопасное сравнение строк (защита от timing attacks)
 */
export function secureCompare(a: string, b: string): boolean {
	if (a.length !== b.length) {
		return false;
	}

	let result = 0;
	for (let i = 0; i < a.length; i++) {
		result |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}

	return result === 0;
}

/**
 * Кодировать в Base64
 */
export function encodeBase64(text: string): string {
	if (typeof Buffer !== 'undefined') {
		return Buffer.from(text).toString('base64');
	}
	return btoa(text);
}

/**
 * Декодировать из Base64
 */
export function decodeBase64(encoded: string): string {
	if (typeof Buffer !== 'undefined') {
		return Buffer.from(encoded, 'base64').toString();
	}
	return atob(encoded);
}

/**
 * Кодировать в Base64 URL-safe
 */
export function encodeBase64Url(text: string): string {
	return encodeBase64(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Декодировать из Base64 URL-safe
 */
export function decodeBase64Url(encoded: string): string {
	let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
	while (base64.length % 4) {
		base64 += '=';
	}
	return decodeBase64(base64);
}

// === Вспомогательные функции ===

function shuffleString(str: string): string {
	const arr = str.split('');
	for (let i = arr.length - 1; i > 0; i--) {
		const j = generateSecureRandom(0, i);
		[arr[i], arr[j]] = [arr[j]!, arr[i]!];
	}
	return arr.join('');
}

// Declare Bun types for TypeScript
declare const Bun: {
	password: {
		hash(password: string, options?: { algorithm: string; cost: number }): Promise<string>;
		verify(password: string, hash: string): Promise<boolean>;
	};
};

