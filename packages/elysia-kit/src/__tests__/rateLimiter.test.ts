import { describe, expect, spyOn, test } from 'bun:test';
import { Elysia } from 'elysia';
import { rateLimiter } from '../middleware/rateLimiter.js';

describe('rateLimiter', () => {
	test('should not create a background cleanup interval', () => {
		const interval = spyOn(globalThis, 'setInterval');
		try {
			rateLimiter({ max: 5, windowMs: 60000 });
			expect(interval).not.toHaveBeenCalled();
		} finally {
			interval.mockRestore();
		}
	});

	test('should reject invalid resource bounds at construction', () => {
		for (const config of [{ max: 0 }, { windowMs: 0 }, { maxEntries: 0 }]) {
			expect(() => rateLimiter(config)).toThrow(RangeError);
		}
	});

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

	test('should ignore spoofable proxy headers unless proxy trust is explicit', async () => {
		const app = new Elysia()
			.use(rateLimiter({ max: 1, windowMs: 60000 }))
			.get('/test', () => ({ message: 'ok' }));
		const first = await app.handle(
			new Request('http://localhost/test', { headers: { 'x-forwarded-for': '198.51.100.1' } })
		);
		const second = await app.handle(
			new Request('http://localhost/test', { headers: { 'x-forwarded-for': '198.51.100.2' } })
		);
		expect(first.status).toBe(200);
		expect(second.status).toBe(429);
	});

	test('should honor forwarded client identity only when trustProxy is enabled', async () => {
		const app = new Elysia()
			.use(rateLimiter({ max: 1, trustProxy: true, windowMs: 60000 }))
			.get('/test', () => ({ message: 'ok' }));
		const first = await app.handle(
			new Request('http://localhost/test', { headers: { 'x-forwarded-for': '198.51.100.1' } })
		);
		const second = await app.handle(
			new Request('http://localhost/test', { headers: { 'x-forwarded-for': '198.51.100.2' } })
		);
		expect(first.status).toBe(200);
		expect(second.status).toBe(200);
	});

	test('should apply independently configured limiter instances without plugin deduplication', async () => {
		const app = new Elysia()
			.use(rateLimiter({ keyGenerator: () => 'client', max: 100, windowMs: 60000 }))
			.use(rateLimiter({ keyGenerator: () => 'client', max: 1, windowMs: 60000 }))
			.get('/test', () => ({ message: 'ok' }));
		expect((await app.handle(new Request('http://localhost/test'))).status).toBe(200);
		expect((await app.handle(new Request('http://localhost/test'))).status).toBe(429);
	});

	test('should bound unseen client keys with a fail-closed overflow bucket', async () => {
		const app = new Elysia()
			.use(
				rateLimiter({
					keyGenerator: (request) => request.headers.get('x-client') ?? 'anonymous',
					max: 1,
					maxEntries: 1,
					windowMs: 60000
				})
			)
			.get('/test', () => ({ message: 'ok' }));
		const request = (client: string) =>
			app.handle(new Request('http://localhost/test', { headers: { 'x-client': client } }));
		expect((await request('client-a')).status).toBe(200);
		expect((await request('client-b')).status).toBe(200);
		expect((await request('client-c')).status).toBe(429);
	});

	test('should not reset an active client counter when overflow starts', async () => {
		const app = new Elysia()
			.use(
				rateLimiter({
					keyGenerator: (request) => request.headers.get('x-client') ?? 'anonymous',
					max: 2,
					maxEntries: 2,
					windowMs: 60000
				})
			)
			.get('/test', () => ({ message: 'ok' }));
		const request = (client: string) =>
			app.handle(new Request('http://localhost/test', { headers: { 'x-client': client } }));
		const statuses = [];
		for (const client of ['a', 'a', 'b', 'c', 'a']) statuses.push((await request(client)).status);
		expect(statuses).toEqual([200, 200, 200, 200, 429]);
	});
});
