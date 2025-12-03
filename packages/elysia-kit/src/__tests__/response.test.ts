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
		const response = respond.success({ id: 1 }, { page: 1, limit: 10, total: 100 });
		expect(response.success).toBe(true);
		expect(response.meta).toEqual({ page: 1, limit: 10, total: 100 });
	});
});

describe('respond.error', () => {
	test('should create error response', () => {
		const response = respond.error('Something went wrong', 500);
		expect(response.success).toBe(false);
		expect(response.error).toBe('Something went wrong');
	});

	test('should create error response with details', () => {
		const response = respond.error('Validation failed', 400, { field: 'email' });
		expect(response.success).toBe(false);
		expect(response.error).toBe('Validation failed');
		expect(response.details).toEqual({ field: 'email' });
	});
});

describe('respond.paginated', () => {
	test('should create paginated response', () => {
		const data = [{ id: 1 }, { id: 2 }];
		const response = respond.paginated(data, 1, 10, 100);
		expect(response.success).toBe(true);
		expect(response.data).toEqual(data);
		expect(response.meta.page).toBe(1);
		expect(response.meta.limit).toBe(10);
		expect(response.meta.total).toBe(100);
		expect(response.meta.totalPages).toBe(10);
	});

	test('should calculate totalPages correctly', () => {
		const response = respond.paginated([], 1, 10, 25);
		expect(response.meta.totalPages).toBe(3);
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
		expect(response.data).toBeUndefined();
	});
});
