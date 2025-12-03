/**
 * @fileoverview Tests for soft delete utilities
 */

import { describe, expect, test } from 'bun:test';
import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import {
	getRestoreValues,
	getSoftDeleteValues,
	onlyDeleted,
	withSoftDelete
} from '../query/softDelete.js';

const testTable = pgTable('test', {
	id: uuid('id').primaryKey(),
	name: text('name'),
	deletedAt: timestamp('deleted_at', { withTimezone: true }),
	isDeleted: boolean('is_deleted').default(false)
});

describe('withSoftDelete', () => {
	test('should build filter with deletedAt column only', () => {
		const result = withSoftDelete({ deletedAtColumn: testTable.deletedAt });
		expect(result).toBeDefined();
	});

	test('should build filter with both deletedAt and isDeleted columns', () => {
		const result = withSoftDelete({
			deletedAtColumn: testTable.deletedAt,
			isDeletedColumn: testTable.isDeleted
		});
		expect(result).toBeDefined();
	});
});

describe('onlyDeleted', () => {
	test('should build filter for deleted records with deletedAt only', () => {
		const result = onlyDeleted({ deletedAtColumn: testTable.deletedAt });
		expect(result).toBeDefined();
	});

	test('should build filter for deleted records with isDeleted column', () => {
		const result = onlyDeleted({
			deletedAtColumn: testTable.deletedAt,
			isDeletedColumn: testTable.isDeleted
		});
		expect(result).toBeDefined();
	});
});

describe('getSoftDeleteValues', () => {
	test('should return soft delete values', () => {
		const values = getSoftDeleteValues();
		expect(values.deletedAt).toBeInstanceOf(Date);
		expect(values.isDeleted).toBe(true);
	});

	test('should set deletedAt to current date', () => {
		const before = new Date();
		const values = getSoftDeleteValues();
		const after = new Date();
		expect(values.deletedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
		expect(values.deletedAt.getTime()).toBeLessThanOrEqual(after.getTime());
	});
});

describe('getRestoreValues', () => {
	test('should return restore values', () => {
		const values = getRestoreValues();
		expect(values.deletedAt).toBeNull();
		expect(values.isDeleted).toBe(false);
	});
});
