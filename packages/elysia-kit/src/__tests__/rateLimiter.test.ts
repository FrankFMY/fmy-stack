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

	test('should set rate limit headers on subsequent requests', async () => {
		const app = new Elysia()
			.use(rateLimiter({ max: 10, windowMs: 60000 }))
			.get('/test', () => ({ message: 'ok' }));

		// First request initializes the entry
		await app.handle(new Request('http://localhost/test'));

		// Second request should have rate limit headers
		const response = await app.handle(new Request('http://localhost/test'));
		expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
		expect(response.headers.get('X-RateLimit-Remaining')).toBe('8');
	});

	test('should decrement remaining count correctly', async () => {
		const app = new Elysia()
			.use(rateLimiter({ max: 5, windowMs: 60000 }))
			.get('/test', () => ({ message: 'ok' }));

		await app.handle(new Request('http://localhost/test')); // count: 1
		await app.handle(new Request('http://localhost/test')); // count: 2
		const response = await app.handle(new Request('http://localhost/test')); // count: 3

		expect(response.headers.get('X-RateLimit-Remaining')).toBe('2');
	});
});
