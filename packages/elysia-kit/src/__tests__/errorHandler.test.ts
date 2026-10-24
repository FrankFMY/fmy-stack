import { describe, expect, test } from 'bun:test';
import { Elysia, t } from 'elysia';
import { ApiError, HttpStatus } from '../utils/errors.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { createApp } from '../app/createApp.js';

describe('errorHandler', () => {
	for (const installation of ['plugin', 'factory'] as const) {
		test(`sanitizes production exception bodies through ${installation}`, async () => {
			const before = process.env.NODE_ENV;
			process.env.NODE_ENV = 'production';
			try {
				const handler = () => {
					throw new Error('internal-database-location-test-canary');
				};
				const app =
					installation === 'plugin'
						? new Elysia().use(errorHandler).get('/private-error', handler)
						: createApp({ prefix: '', logging: false }).get('/private-error', handler);
				const response = await app.handle(new Request('http://localhost/private-error'));
				expect(response.status).toBe(500);
				const body = await response.text();
				expect(body).not.toContain('internal-database-location-test-canary');
				expect(JSON.parse(body)).toEqual({ success: false, error: 'Internal server error' });
			} finally {
				if (before === undefined) delete process.env.NODE_ENV;
				else process.env.NODE_ENV = before;
			}
		});
	}
	test('preserves framework 404 for an unknown route', async () => {
		const response = await new Elysia()
			.use(errorHandler)
			.handle(new Request('http://localhost/missing'));
		expect(response.status).toBe(404);
	});

	test('preserves framework 400 for malformed request JSON', async () => {
		const app = new Elysia().use(errorHandler).post('/parse', ({ body }) => body, {
			body: t.Object({ value: t.String() })
		});
		const response = await app.handle(
			new Request('http://localhost/parse', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: '{'
			})
		);
		expect(response.status).toBe(400);
	});

	test('should handle ApiError', async () => {
		const app = new Elysia().use(errorHandler).get('/error', () => {
			throw new ApiError(HttpStatus.NOT_FOUND, 'Not found');
		});
		const response = await app.handle(new Request('http://localhost/error'));
		expect(response.status).toBe(404);
		expect(await response.json()).toEqual({ success: false, error: 'Not found' });
	});

	test('should handle generic errors', async () => {
		const app = new Elysia().use(errorHandler).get('/error', () => {
			throw new Error('Internal');
		});
		const response = await app.handle(new Request('http://localhost/error'));
		expect(response.status).toBe(500);
	});
});
