/**
 * @fileoverview FMY Stack
 * @author Artem Prianishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2026 Artem Prianishnikov
 * @license Apache-2.0
 *
 * Middleware для ограничения частоты запросов (rate limiting)
 */

import { Elysia } from 'elysia';
import { ApiError, HttpStatus } from '../utils/errors.js';

/**
 * Конфигурация для rate limiter middleware.
 */
export interface RateLimitConfig {
	/** Временное окно в миллисекундах (по умолчанию 60000 = 1 минута) */
	windowMs?: number;
	/** Максимальное количество запросов в окне (по умолчанию 100) */
	max?: number;
	/** Сообщение об ошибке при превышении лимита */
	message?: string;
	/** Функция для генерации ключа идентификации клиента (по умолчанию использует IP) */
	keyGenerator?: (request: Request) => string;
	/** Доверять X-Forwarded-For/X-Real-IP только за настроенным trusted proxy */
	trustProxy?: boolean;
	/** Максимальное количество активных buckets, включая fail-closed overflow */
	maxEntries?: number;
}

interface RateLimitEntry {
	count: number;
	resetTime: number;
}

const defaultConfig = {
	windowMs: 60 * 1000, // 1 minute
	max: 100,
	message: 'Too many requests, please try again later',
	trustProxy: false,
	maxEntries: 10_000
};

let rateLimiterInstance = 0;

function proxyKey(request: Request): string {
	const forwarded = request.headers.get('x-forwarded-for');
	const realIp = request.headers.get('x-real-ip');
	return forwarded?.split(',')[0]?.trim() || realIp || 'anonymous';
}

/**
 * Создает middleware для ограничения частоты запросов (rate limiting).
 * Отслеживает количество запросов от каждого клиента и блокирует при превышении лимита.
 * Автоматически устанавливает HTTP заголовки X-RateLimit-* для информирования клиента.
 * @param config - Конфигурация rate limiter
 * @returns ElysiaJS plugin с rate limiting
 * @example
 * app.use(rateLimiter({ windowMs: 60000, max: 100 }));
 * // Ограничивает до 100 запросов в минуту с каждого IP
 */
export function rateLimiter(config: RateLimitConfig = {}) {
	const finalConfig = { ...defaultConfig, ...config };
	if (
		!Number.isSafeInteger(finalConfig.max) ||
		finalConfig.max < 1 ||
		finalConfig.max > 1_000_000_000
	) {
		throw new RangeError('Rate limiter max is invalid');
	}
	if (
		!Number.isSafeInteger(finalConfig.windowMs) ||
		finalConfig.windowMs < 1 ||
		finalConfig.windowMs > 86_400_000
	) {
		throw new RangeError('Rate limiter windowMs is invalid');
	}
	if (
		!Number.isInteger(finalConfig.maxEntries) ||
		finalConfig.maxEntries < 1 ||
		finalConfig.maxEntries > 1_000_000
	) {
		throw new RangeError('Rate limiter maxEntries is invalid');
	}
	const keyGenerator =
		config.keyGenerator ?? (finalConfig.trustProxy ? proxyKey : () => 'anonymous');
	const store = new Map<string, RateLimitEntry>();
	let overflowEntry: RateLimitEntry | undefined;

	rateLimiterInstance += 1;
	const seed = rateLimiterInstance;
	return new Elysia({ name: 'rate-limiter', seed }).onRequest(({ request, set }) => {
		const now = Date.now();
		for (const [storedKey, storedEntry] of store) {
			if (storedEntry.resetTime < now) store.delete(storedKey);
		}
		if (overflowEntry && overflowEntry.resetTime < now) overflowEntry = undefined;
		const generatedKey = keyGenerator(request);
		const key =
			typeof generatedKey === 'string' && generatedKey.trim()
				? generatedKey.trim().slice(0, 512)
				: 'anonymous';
		let entry = store.get(key);
		let usesOverflow = false;
		if (!entry && store.size >= finalConfig.maxEntries) {
			usesOverflow = true;
			entry = overflowEntry;
		}

		if (!entry || entry.resetTime < now) {
			const created = {
				count: 1,
				resetTime: now + finalConfig.windowMs
			};
			if (usesOverflow) overflowEntry = created;
			else store.set(key, created);
			return;
		}

		entry.count++;

		// Set rate limit headers
		set.headers['X-RateLimit-Limit'] = String(finalConfig.max);
		set.headers['X-RateLimit-Remaining'] = String(Math.max(0, finalConfig.max - entry.count));
		set.headers['X-RateLimit-Reset'] = String(Math.ceil(entry.resetTime / 1000));

		if (entry.count > finalConfig.max) {
			throw new ApiError(HttpStatus.TOO_MANY_REQUESTS, finalConfig.message);
		}
	});
}
