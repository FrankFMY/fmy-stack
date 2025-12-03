import { describe, expect, test } from 'bun:test';
import { Elysia } from 'elysia';
import { ApiError, HttpStatus } from '../utils/errors.js';
import { errorHandler } from '../middleware/errorHandler.js';

describe('errorHandler', () => {
	test('should handle ApiError', async () => {
		const app = new Elysia().use(errorHandler).get('/error', () => {
			throw new ApiError(HttpStatus.NOT_FOUND, 'Not found');
		});
		const response = await app.handle(new Request('http://localhost/error'));
		expect(response.status).toBe(404);
	});

	test('should handle generic errors', async () => {
		const app = new Elysia().use(errorHandler).get('/error', () => {
			throw new Error('Internal');
		});
		const response = await app.handle(new Request('http://localhost/error'));
		expect(response.status).toBe(500);
	});
});
