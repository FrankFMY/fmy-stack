/**
 * @fileoverview Tests for createApp utility
 */

import { describe, expect, test } from 'bun:test';
import { createApp } from '../app/createApp.js';

describe('createApp', () => {
	test('preserves configured docs and JSON endpoints with real route metadata', async () => {
		const app = createApp({
			prefix: '/api',
			logging: false,
			swagger: {
				path: '/reference',
				documentation: { info: { title: 'Consumer API', version: '2.0.0' } }
			}
		}).get('/health', () => 'healthy');
		const ui = await app.handle(new Request('http://localhost/api/reference'));
		expect(ui.status).toBe(200);
		expect(ui.headers.get('content-type')).toContain('text/html');
		const response = await app.handle(new Request('http://localhost/api/reference/json'));
		expect(response.status).toBe(200);
		const document = await response.json();
		expect(document.info.title).toBe('Consumer API');
		expect(document.info.version).toBe('2.0.0');
		expect(document.paths['/api/health']).toBeDefined();
	});
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
