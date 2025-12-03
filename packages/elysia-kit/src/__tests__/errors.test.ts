import { describe, expect, test } from 'bun:test';
import { ApiError, HttpStatus } from '../utils/errors.js';

describe('ApiError', () => {
	test('should create error with status and message', () => {
		const error = new ApiError(HttpStatus.BAD_REQUEST, 'Invalid input');
		expect(error.status).toBe(400);
		expect(error.message).toBe('Invalid input');
	});

	test('badRequest should create 400 error', () => {
		expect(ApiError.badRequest('Bad').status).toBe(400);
	});

	test('unauthorized should create 401 error', () => {
		expect(ApiError.unauthorized().status).toBe(401);
	});

	test('forbidden should create 403 error', () => {
		expect(ApiError.forbidden().status).toBe(403);
	});

	test('notFound should create 404 error', () => {
		expect(ApiError.notFound().status).toBe(404);
	});

	test('internal should create 500 error', () => {
		expect(ApiError.internal().status).toBe(500);
	});
});

describe('HttpStatus', () => {
	test('should have standard codes', () => {
		expect(HttpStatus.OK).toBe(200);
		expect(HttpStatus.BAD_REQUEST).toBe(400);
		expect(HttpStatus.INTERNAL_SERVER_ERROR).toBe(500);
	});
});
