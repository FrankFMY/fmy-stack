/**
 * @fileoverview FrankFMY Platform — Initiative Development
 * @author Artyom Pryanishnikov | @license PolyForm-Shield-1.0.0
 */

import { Elysia } from 'elysia';
import { ApiError, HttpStatus } from '../utils/errors.js';

export interface RateLimitConfig {
	windowMs?: number;
	max?: number;
	message?: string;
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

export function rateLimiter(config: RateLimitConfig = {}) {
	const finalConfig = { ...defaultConfig, ...config };
	const store = new Map<string, RateLimitEntry>();

	// Cleanup old entries periodically
	setInterval(
		() => {
			const now = Date.now();
			for (const [key, entry] of store.entries()) {
				if (entry.resetTime < now) {
					store.delete(key);
				}
			}
		},
		finalConfig.windowMs * 2
	);

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
		set.headers['X-RateLimit-Remaining'] = String(
			Math.max(0, finalConfig.max - entry.count)
		);
		set.headers['X-RateLimit-Reset'] = String(Math.ceil(entry.resetTime / 1000));

		if (entry.count > finalConfig.max) {
			throw new ApiError(HttpStatus.TOO_MANY_REQUESTS, finalConfig.message);
		}
	});
}

