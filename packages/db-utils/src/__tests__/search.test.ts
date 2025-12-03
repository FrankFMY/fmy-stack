import { describe, expect, test } from 'bun:test';
import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { buildSearchFilter } from '../query/search.js';

const testTable = pgTable('test', {
	id: uuid('id').primaryKey(),
	name: text('name'),
	email: text('email')
});

describe('buildSearchFilter', () => {
	test('should return undefined for empty query', () => {
		const result = buildSearchFilter('', [testTable.name]);
		expect(result).toBeUndefined();
	});

	test('should return undefined for whitespace-only query', () => {
		const result = buildSearchFilter('   ', [testTable.name]);
		expect(result).toBeUndefined();
	});

	test('should build contains filter by default', () => {
		const result = buildSearchFilter('test', [testTable.name]);
		expect(result).toBeDefined();
	});

	test('should build startsWith filter', () => {
		const result = buildSearchFilter('test', [testTable.name], { mode: 'startsWith' });
		expect(result).toBeDefined();
	});

	test('should return undefined for empty columns array', () => {
		const result = buildSearchFilter('test', []);
		expect(result).toBeUndefined();
	});
});
