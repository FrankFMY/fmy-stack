import { describe, expect, test } from 'bun:test';
import { Elysia } from 'elysia';
import { rateLimiter } from '../middleware/rateLimiter.js';

describe('rateLimiter', () => {
	test('should allow requests within limit', async () => {
		const app = new Elysia()
			.use(rateLimiter({ max: 5, windowMs: 60000 }))
			.get('/test', () => ({ message: 'ok' }));
		const response = await app.handle(new Request('http://localhost/test'));
		expect(response.status).toBe(200);
	});

	test('should block requests exceeding limit', async () => {
		const app = new Elysia()
			.use(rateLimiter({ max: 2, windowMs: 60000 }))
			.get('/test', () => ({ message: 'ok' }));
		await app.handle(new Request('http://localhost/test'));
		await app.handle(new Request('http://localhost/test'));
		const response = await app.handle(new Request('http://localhost/test'));
		expect(response.status).toBe(429);
	});

	test('should set rate limit headers', async () => {
		const app = new Elysia()
			.use(rateLimiter({ max: 10, windowMs: 60000 }))
			.get('/test', () => ({ message: 'ok' }));
		const response = await app.handle(new Request('http://localhost/test'));
		expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
	});
});
