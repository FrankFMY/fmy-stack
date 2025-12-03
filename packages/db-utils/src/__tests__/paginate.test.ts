import { describe, expect, test } from 'bun:test';
import { buildPaginatedResult, paginate } from '../query/paginate.js';
import type { PgSelect } from 'drizzle-orm/pg-core';

// Mock PgSelect query for testing
function createMockQuery(options: { limitValue?: number; offsetValue?: number } = {}): PgSelect & {
	_limit: number;
	_offset: number;
} {
	const query = {
		_limit: options.limitValue ?? 0,
		_offset: options.offsetValue ?? 0,
		limit(value: number) {
			this._limit = value;
			return this;
		},
		offset(value: number) {
			this._offset = value;
			return this;
		}
	};
	return query as unknown as PgSelect & { _limit: number; _offset: number };
}

describe('paginate', () => {
	test('should apply default pagination', () => {
		const mockQuery = createMockQuery();
		const result = paginate(mockQuery);
		expect(result._limit).toBe(20);
		expect(result._offset).toBe(0);
	});

	test('should apply custom page and limit', () => {
		const mockQuery = createMockQuery();
		const result = paginate(mockQuery, { page: 3, limit: 10 });
		expect(result._limit).toBe(10);
		expect(result._offset).toBe(20);
	});

	test('should enforce maxLimit', () => {
		const mockQuery = createMockQuery();
		const result = paginate(mockQuery, { limit: 500, maxLimit: 100 });
		expect(result._limit).toBe(100);
	});

	test('should handle page 1 correctly', () => {
		const mockQuery = createMockQuery();
		const result = paginate(mockQuery, { page: 1, limit: 10 });
		expect(result._limit).toBe(10);
		expect(result._offset).toBe(0);
	});

	test('should handle invalid page values', () => {
		const mockQuery = createMockQuery();
		const result = paginate(mockQuery, { page: -1, limit: 10 });
		expect(result._offset).toBe(0);
	});
});

describe('buildPaginatedResult', () => {
	test('should build paginated result', async () => {
		const result = await buildPaginatedResult([{ id: 1 }], 50, { page: 1, limit: 10 });
		expect(result.data).toHaveLength(1);
		expect(result.meta.total).toBe(50);
		expect(result.meta.page).toBe(1);
		expect(result.meta.limit).toBe(10);
		expect(result.meta.totalPages).toBe(5);
		expect(result.meta.hasNext).toBe(true);
		expect(result.meta.hasPrev).toBe(false);
	});

	test('should handle last page', async () => {
		const result = await buildPaginatedResult([{ id: 50 }], 50, { page: 5, limit: 10 });
		expect(result.meta.hasNext).toBe(false);
		expect(result.meta.hasPrev).toBe(true);
	});

	test('should handle empty data', async () => {
		const result = await buildPaginatedResult([], 0, { page: 1, limit: 10 });
		expect(result.data).toHaveLength(0);
		expect(result.meta.total).toBe(0);
		expect(result.meta.totalPages).toBe(0);
		expect(result.meta.hasNext).toBe(false);
		expect(result.meta.hasPrev).toBe(false);
	});

	test('should calculate totalPages correctly', async () => {
		const result = await buildPaginatedResult([], 25, { page: 1, limit: 10 });
		expect(result.meta.totalPages).toBe(3);
	});
});
