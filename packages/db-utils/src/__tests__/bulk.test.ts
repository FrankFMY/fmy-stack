/**
 * @fileoverview Tests for bulk operations
 */

import { describe, expect, test } from 'bun:test';
import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { bulkInsert, bulkUpdate, bulkUpsert } from '../bulk/operations.js';

const testTable = pgTable('test', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name'),
	email: text('email').unique()
});

interface MockDb {
	insertions: unknown[];
	rowCount: number;
	insert(table: unknown): {
		values(data: unknown[]): {
			onConflictDoNothing(): { rowCount: number };
			onConflictDoUpdate(config: unknown): { rowCount: number };
		};
	};
	transaction(callback: (tx: MockDb) => Promise<void>): Promise<void>;
	execute(query: unknown): Promise<{ rowCount: number }>;
}

function createMockDb(): MockDb {
	const db: MockDb = {
		insertions: [],
		rowCount: 0,
		insert(_table: unknown) {
			return {
				values: (data: unknown[]) => {
					db.insertions.push(...data);
					return {
						onConflictDoNothing: () => ({ rowCount: data.length }),
						onConflictDoUpdate: () => ({ rowCount: data.length })
					};
				}
			};
		},
		transaction(callback: (tx: MockDb) => Promise<void>): Promise<void> {
			return callback(db);
		},
		execute(): Promise<{ rowCount: number }> {
			return Promise.resolve({ rowCount: db.rowCount });
		}
	};
	return db;
}

function asBulkDb(db: MockDb): Parameters<typeof bulkInsert>[0] {
	return db as unknown as Parameters<typeof bulkInsert>[0];
}

describe('bulkInsert', () => {
	test('should return 0 for empty data', async () => {
		const db = createMockDb();
		const result = await bulkInsert(asBulkDb(db), testTable, []);
		expect(result).toBe(0);
	});

	test('should insert data in chunks', async () => {
		const db = createMockDb();
		const data = Array.from({ length: 5 }, (_, i) => ({
			name: `test${i}`,
			email: `test${i}@example.com`
		}));
		const result = await bulkInsert(
			asBulkDb(db),
			testTable,
			data as Parameters<typeof bulkInsert>[2],
			{ chunkSize: 2 }
		);
		expect(result).toBe(5);
		expect(db.insertions.length).toBe(5);
	});

	test('should use default chunkSize', async () => {
		const db = createMockDb();
		const data = [{ name: 'test', email: 'test@example.com' }];
		const result = await bulkInsert(
			asBulkDb(db),
			testTable,
			data as Parameters<typeof bulkInsert>[2]
		);
		expect(result).toBe(1);
	});

	test('should skip duplicates when enabled', async () => {
		const db = createMockDb();
		const data = [{ name: 'test', email: 'test@example.com' }];
		const result = await bulkInsert(
			asBulkDb(db),
			testTable,
			data as Parameters<typeof bulkInsert>[2],
			{ skipDuplicates: true }
		);
		expect(result).toBe(1);
	});
});

describe('bulkUpdate', () => {
	test('should return 0 for empty data', async () => {
		const db = createMockDb();
		const result = await bulkUpdate(asBulkDb(db), 'test', []);
		expect(result).toBe(0);
	});

	test('should update data in chunks', async () => {
		const db = createMockDb();
		const data = [
			{ id: '1', name: 'updated1' },
			{ id: '2', name: 'updated2' }
		];
		const result = await bulkUpdate(asBulkDb(db), 'test', data, { chunkSize: 1 });
		expect(result).toBe(2);
	});

	test('should use default chunkSize', async () => {
		const db = createMockDb();
		const data = [{ id: '1', name: 'updated' }];
		const result = await bulkUpdate(asBulkDb(db), 'test', data);
		expect(result).toBe(1);
	});
});

describe('bulkUpsert', () => {
	test('should return 0 for empty data', async () => {
		const db = createMockDb();
		const result = await bulkUpsert(
			asBulkDb(db),
			testTable,
			[] as Parameters<typeof bulkUpsert>[2],
			'id' as Parameters<typeof bulkUpsert>[3],
			['name'] as Parameters<typeof bulkUpsert>[4]
		);
		expect(result).toBe(0);
	});

	test('should upsert data in chunks', async () => {
		const db = createMockDb();
		const data = [
			{ name: 'test1', email: 'test1@example.com' },
			{ name: 'test2', email: 'test2@example.com' }
		];
		const result = await bulkUpsert(
			asBulkDb(db),
			testTable,
			data as Parameters<typeof bulkUpsert>[2],
			'id' as Parameters<typeof bulkUpsert>[3],
			['name'] as Parameters<typeof bulkUpsert>[4],
			{ chunkSize: 1 }
		);
		expect(result).toBe(2);
	});

	test('should use default chunkSize', async () => {
		const db = createMockDb();
		const data = [{ name: 'test', email: 'test@example.com' }];
		const result = await bulkUpsert(
			asBulkDb(db),
			testTable,
			data as Parameters<typeof bulkUpsert>[2],
			'id' as Parameters<typeof bulkUpsert>[3],
			['name'] as Parameters<typeof bulkUpsert>[4]
		);
		expect(result).toBe(1);
	});
});
