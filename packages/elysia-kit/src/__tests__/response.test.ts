/**
 * @fileoverview Tests for response utilities
 */

import { describe, expect, test } from 'bun:test';
import { respond } from '../utils/response.js';

describe('respond.success', () => {
	test('should create success response with data', () => {
		const response = respond.success({ id: 1, name: 'test' });
		expect(response.success).toBe(true);
		expect(response.data).toEqual({ id: 1, name: 'test' });
	});

	test('should create success response with meta', () => {
		const response = respond.success({ id: 1 }, { requestId: 'abc123' });
		expect(response.success).toBe(true);
		expect(response.meta).toEqual({ requestId: 'abc123' });
	});
});

describe('respond.error', () => {
	test('should create error response', () => {
		const response = respond.error('Something went wrong', 500);
		expect(response.success).toBe(false);
		expect(response.error.message).toBe('Something went wrong');
		expect(response.error.code).toBe(500);
	});

	test('should create error response with details', () => {
		const response = respond.error('Validation failed', 400, { field: 'email' });
		expect(response.error.details).toEqual({ field: 'email' });
	});
});

describe('respond.paginated', () => {
	test('should create paginated response', () => {
		const data = [{ id: 1 }, { id: 2 }];
		const response = respond.paginated(data, 100, 1, 10);
		expect(response.success).toBe(true);
		expect(response.data).toEqual(data);
		expect(response.pagination.total).toBe(100);
		expect(response.pagination.page).toBe(1);
		expect(response.pagination.limit).toBe(10);
		expect(response.pagination.totalPages).toBe(10);
	});

	test('should calculate totalPages correctly', () => {
		const response = respond.paginated([], 25, 1, 10);
		expect(response.pagination.totalPages).toBe(3);
	});
});

describe('respond.created', () => {
	test('should create created response', () => {
		const response = respond.created({ id: 1, name: 'new item' });
		expect(response.success).toBe(true);
		expect(response.data).toEqual({ id: 1, name: 'new item' });
	});
});

describe('respond.noContent', () => {
	test('should create no content response', () => {
		const response = respond.noContent();
		expect(response.success).toBe(true);
		expect(response.data).toBeNull();
	});
});
