/**
 * @fileoverview Tests for createApp utility
 */

import { describe, expect, test } from 'bun:test';
import { createApp } from '../app/createApp.js';

describe('createApp', () => {
	test('should create app with default config', async () => {
		const app = createApp();
		const response = await app
			.handle(new Request('http://localhost/api/test'))
			.then((r) => r.text());
		expect(response).toBeDefined();
	});

	test('should create app with custom name', () => {
		const app = createApp({ name: 'Test API' });
		expect(app).toBeDefined();
	});

	test('should create app with custom prefix', async () => {
		const app = createApp({ prefix: '/api/v1' });
		app.get('/test', () => ({ message: 'test' }));

		const response = await app
			.handle(new Request('http://localhost/api/v1/test'))
			.then((r) => r.json());
		expect(response).toEqual({ message: 'test' });
	});

	test('should create app with CORS enabled', () => {
		const app = createApp({
			cors: { origin: true, methods: ['GET', 'POST'], credentials: true }
		});
		expect(app).toBeDefined();
	});

	test('should create app with Swagger', () => {
		const app = createApp({
			swagger: {
				path: '/api-docs',
				documentation: {
					info: { title: 'Test API', version: '1.0.0', description: 'Test API documentation' }
				}
			}
		});
		expect(app).toBeDefined();
	});

	test('should create app with logging disabled', () => {
		const app = createApp({ logging: false });
		expect(app).toBeDefined();
	});

	test('should handle errors with error handler', async () => {
		const app = createApp();
		app.get('/error', () => {
			throw new Error('Test error');
		});

		const response = await app.handle(new Request('http://localhost/api/error'));
		expect(response.status).toBe(500);
		const text = await response.text();
		expect(text).toBeDefined();
	});
});
