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
}

interface RateLimitEntry {
	count: number;
	resetTime: number;
}

const defaultConfig: Required<RateLimitConfig> = {
	windowMs: 60 * 1000, // 1 minute
	max: 100,
	message: 'Too many requests, please try again later',
	keyGenerator: (request) => {
		// Use IP from headers or fallback
		const forwarded = request.headers.get('x-forwarded-for');
		const realIp = request.headers.get('x-real-ip');
		return forwarded?.split(',')[0]?.trim() || realIp || 'unknown';
	}
};

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
	const store = new Map<string, RateLimitEntry>();

	// Cleanup old entries periodically
	setInterval(() => {
		const now = Date.now();
		for (const [key, entry] of store.entries()) {
			if (entry.resetTime < now) {
				store.delete(key);
			}
		}
	}, finalConfig.windowMs * 2);

	return new Elysia({ name: 'rate-limiter' }).onRequest(({ request, set }) => {
		const key = finalConfig.keyGenerator(request);
		const now = Date.now();
		const entry = store.get(key);

		if (!entry || entry.resetTime < now) {
			store.set(key, {
				count: 1,
				resetTime: now + finalConfig.windowMs
			});
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
