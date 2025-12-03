import { describe, expect, test } from 'bun:test';
import { buildPaginatedResult, paginate } from '../query/paginate.js';

describe('paginate', () => {
	test('should apply default pagination', () => {
		const result = paginate({});
		expect(result.limit).toBe(20);
		expect(result.offset).toBe(0);
	});

	test('should apply custom page and limit', () => {
		const result = paginate({ page: 3, limit: 10 });
		expect(result.limit).toBe(10);
		expect(result.offset).toBe(20);
	});

	test('should enforce maxLimit', () => {
		const result = paginate({ limit: 500 }, { maxLimit: 100 });
		expect(result.limit).toBe(100);
	});
});

describe('buildPaginatedResult', () => {
	test('should build paginated result', () => {
		const result = buildPaginatedResult([{ id: 1 }], 50, { page: 1, limit: 10 });
		expect(result.data).toHaveLength(1);
		expect(result.meta.total).toBe(50);
		expect(result.meta.page).toBe(1);
		expect(result.meta.limit).toBe(10);
		expect(result.meta.totalPages).toBe(5);
		expect(result.meta.hasNext).toBe(true);
		expect(result.meta.hasPrev).toBe(false);
	});
});
