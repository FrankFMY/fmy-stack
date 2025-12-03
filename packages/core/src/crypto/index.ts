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
 * Генерирует UUID версии 4 (случайный UUID).
 * Использует криптографически безопасный генератор случайных чисел.
 * @returns UUID в формате xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 * @example
 * generateUUID() // '550e8400-e29b-41d4-a716-446655440000'
 */
export function generateUUID(): string {
	return crypto.randomUUID();
}

/**
 * Генерирует короткий уникальный идентификатор (nanoid).
 * Использует URL-friendly алфавит для безопасного использования в URL.
 * @param length - Длина генерируемой строки (по умолчанию 21)
 * @returns Уникальная строка указанной длины
 * @example
 * generateNanoid() // 'V1StGXR8_Z5jdHi6B-myT'
 * generateNanoid(8) // '2K3jF7xP'
 */
export function generateNanoid(length = 21): string {
	return nanoid(length);
}

/**
 * Генерирует криптографически безопасный токен в шестнадцатеричном формате.
 * Полезно для создания API ключей, секретных токенов и т.д.
 * @param length - Количество байт (по умолчанию 32, результат будет в 2 раза длиннее)
 * @returns Шестнадцатеричная строка токена
 * @example
 * generateToken(16) // 'a1b2c3d4e5f678901234567890abcdef'
 */
export function generateToken(length = 32): string {
	const bytes = new Uint8Array(length);
	crypto.getRandomValues(bytes);
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

/**
 * Генерирует криптографически безопасное случайное число в заданном диапазоне.
 * Включает как минимальное, так и максимальное значения.
 * @param min - Минимальное значение (включительно)
 * @param max - Максимальное значение (включительно)
 * @returns Случайное целое число в диапазоне [min, max]
 * @example
 * generateSecureRandom(1, 10) // Может вернуть любое число от 1 до 10
 */
export function generateSecureRandom(min: number, max: number): number {
	const range = max - min + 1;
	const bytes = new Uint32Array(1);
	crypto.getRandomValues(bytes);
	return min + (bytes[0]! % range);
}

/**
 * Хэширует строку с помощью алгоритма SHA-256.
 * Возвращает хэш в шестнадцатеричном формате.
 * @param text - Строка для хэширования
 * @returns Promise с SHA-256 хэшем в hex формате
 * @example
 * await hashSHA256('hello world') // 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
 */
export async function hashSHA256(text: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(text);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Хэширует строку с помощью алгоритма SHA-512.
 * Возвращает хэш в шестнадцатеричном формате.
 * @param text - Строка для хэширования
 * @returns Promise с SHA-512 хэшем в hex формате
 * @example
 * await hashSHA512('hello world') // '309ecc489c12d6eb4cc40f50c902f2b4d0ed77ee511a7c7a9bcd3ca86d4cd86f989dd35bc5ff499670da34255b45b0cfd830e81f605dcf7dc5542e93ae9cd76f'
 */
export async function hashSHA512(text: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(text);
	const hashBuffer = await crypto.subtle.digest('SHA-512', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Хэширует пароль для безопасного хранения.
 * В среде Bun использует bcrypt (рекомендуется), иначе SHA-256 с солью.
 * @param password - Пароль для хэширования
 * @returns Promise с хэшированным паролем
 * @example
 * const hash = await hashPassword('mySecretPassword');
 * // В Bun: '$2b$12$...'
 * // В других средах: '$sha256$salt$hash'
 */
export async function hashPassword(password: string): Promise<string> {
	const bunPassword = getBunPassword();

	if (bunPassword) {
		return await bunPassword.hash(password, {
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
 * Проверяет пароль против хэша.
 * Поддерживает как bcrypt хэши (Bun), так и SHA-256 с солью.
 * @param password - Пароль для проверки
 * @param hash - Хэш пароля для сравнения
 * @returns Promise с результатом проверки (true/false)
 * @example
 * const isValid = await verifyPassword('mySecretPassword', hash);
 * if (isValid) {
 *   // Пароль верный
 * }
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	const bunPassword = getBunPassword();

	if (bunPassword) {
		return await bunPassword.verify(password, hash);
	}

	// Fallback: проверка SHA-256 хэша
	if (hash.startsWith('$sha256$')) {
		const parts = hash.split('$');
		if (parts.length !== 4) return false;
		const salt = parts[2]!;
		const storedHash = parts[3]!;
		const computedHash = await hashSHA256(salt + password);
		return secureCompare(storedHash, computedHash);
	}

	return false;
}

/**
 * Генерирует OTP (одноразовый пароль) состоящий только из цифр.
 * @param length - Длина кода (по умолчанию 6)
 * @returns Строка из цифр указанной длины
 * @example
 * generateOTP() // '123456'
 * generateOTP(8) // '98765432'
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
 * Генерирует API ключ с префиксом 'fmy_'.
 * @returns API ключ в формате 'fmy_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
 * @example
 * generateApiKey() // 'fmy_a1b2c3d4e5f678901234567890abcdef1234567890ab'
 */
export function generateApiKey(): string {
	const prefix = 'fmy';
	const token = generateToken(24);
	return `${prefix}_${token}`;
}

/**
 * Генерирует случайную строку, подходящую для использования в качестве пароля.
 * Гарантирует наличие хотя бы одного символа каждого типа и перемешивает результат.
 * @param length - Длина пароля (по умолчанию 16, минимум 4)
 * @returns Случайная строка с символами разных типов
 * @example
 * generateRandomPassword() // 'Ab3!xYz9$mNp2qR5'
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
 * Проверяет сложность пароля и возвращает оценку с рекомендациями.
 * @param password - Пароль для проверки
 * @returns Объект с оценкой сложности, рекомендациями и флагом надежности
 * @example
 * checkPasswordStrength('weak')
 * // { score: 1, feedback: ['Минимум 8 символов', ...], isStrong: false }
 *
 * checkPasswordStrength('StrongP@ssw0rd')
 * // { score: 6, feedback: [], isStrong: true }
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
 * Безопасно сравнивает две строки, предотвращая timing attacks.
 * Время выполнения не зависит от того, насколько строки отличаются.
 * @param a - Первая строка
 * @param b - Вторая строка
 * @returns `true` если строки идентичны, иначе `false`
 * @example
 * secureCompare('secret', 'secret') // true
 * secureCompare('secret', 'Secret') // false
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
 * Кодирует строку в Base64.
 * Работает как в Node.js (Buffer), так и в браузере (btoa).
 * @param text - Строка для кодирования
 * @returns Base64 представление строки
 * @example
 * encodeBase64('Hello World') // 'SGVsbG8gV29ybGQ='
 */
export function encodeBase64(text: string): string {
	if (typeof Buffer !== 'undefined') {
		return Buffer.from(text).toString('base64');
	}
	return btoa(text);
}

/**
 * Декодирует строку из Base64.
 * Работает как в Node.js (Buffer), так и в браузере (atob).
 * @param encoded - Base64 строка для декодирования
 * @returns Декодированная строка
 * @throws Ошибка если строка не является валидным Base64
 * @example
 * decodeBase64('SGVsbG8gV29ybGQ=') // 'Hello World'
 */
export function decodeBase64(encoded: string): string {
	if (typeof Buffer !== 'undefined') {
		return Buffer.from(encoded, 'base64').toString();
	}
	return atob(encoded);
}

/**
 * Кодирует строку в URL-safe Base64.
 * Заменяет символы + и / на - и _ соответственно, удаляет padding (=).
 * @param text - Строка для кодирования
 * @returns URL-safe Base64 строка
 * @example
 * encodeBase64Url('Hello World') // 'SGVsbG8gV29ybGQ'
 */
export function encodeBase64Url(text: string): string {
	return encodeBase64(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Декодирует строку из URL-safe Base64.
 * @param encoded - URL-safe Base64 строка
 * @returns Декодированная строка
 * @throws Ошибка если строка не является валидным Base64
 * @example
 * decodeBase64Url('SGVsbG8gV29ybGQ') // 'Hello World'
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

/**
 * Тип для глобального объекта с возможным Bun API.
 */
interface GlobalWithBun extends Window {
	Bun?: {
		password?: {
			hash?: (password: string, options?: { algorithm: string; cost: number }) => Promise<string>;
			verify?: (password: string, hash: string) => Promise<boolean>;
		};
	};
}

interface BunPasswordAPI {
	hash(password: string, options?: { algorithm: string; cost: number }): Promise<string>;
	verify(password: string, hash: string): Promise<boolean>;
}

/**
 * Получить Bun.password API если доступен
 */
function getBunPassword(): BunPasswordAPI | null {
	const global = globalThis as unknown as GlobalWithBun;
	if (typeof global.Bun?.password?.hash === 'function') {
		return global.Bun.password as BunPasswordAPI;
	}
	return null;
}

