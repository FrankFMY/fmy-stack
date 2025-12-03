import { describe, expect, test } from 'bun:test';
import { pgTable, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';
import { withSoftDelete, onlyDeleted, getSoftDeleteValues, getRestoreValues } from '../query/softDelete.js';

const testTable = pgTable('test', {
	id: uuid('id').primaryKey(),
	deletedAt: timestamp('deleted_at'),
	isDeleted: boolean('is_deleted').default(false)
});

describe('withSoftDelete', () => {
	test('should build filter with deletedAt column only', () => {
		const filter = withSoftDelete({ deletedAt: testTable.deletedAt });
		expect(filter).toBeDefined();
	});

	test('should build filter with both columns', () => {
		const filter = withSoftDelete({
			deletedAt: testTable.deletedAt,
			isDeleted: testTable.isDeleted
		});
		expect(filter).toBeDefined();
	});
});

describe('onlyDeleted', () => {
	test('should build filter for deleted records', () => {
		const filter = onlyDeleted({ deletedAt: testTable.deletedAt });
		expect(filter).toBeDefined();
	});
});

describe('getSoftDeleteValues', () => {
	test('should return soft delete values', () => {
		const values = getSoftDeleteValues();
		expect(values.deletedAt).toBeInstanceOf(Date);
		expect(values.isDeleted).toBe(true);
	});
});

describe('getRestoreValues', () => {
	test('should return restore values', () => {
		const values = getRestoreValues();
		expect(values.deletedAt).toBeNull();
		expect(values.isDeleted).toBe(false);
	});
});
