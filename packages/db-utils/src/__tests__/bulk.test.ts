/**
 * @fileoverview Tests for bulk operations
 */

import { describe, expect, test } from 'bun:test';
import type { SQL } from 'drizzle-orm';
import { PgDialect, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { bulkInsert, bulkUpdate, bulkUpsert } from '../bulk/operations.js';

const testTable = pgTable('test', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name'),
	email: text('email').unique()
});

interface MockDb {
	insertions: unknown[];
	queries: unknown[];
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
		queries: [],
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
		execute(query: unknown): Promise<{ rowCount: number }> {
			db.queries.push(query);
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

	test('should reject a fractional chunk size', async () => {
		const db = createMockDb();
		for (const chunkSize of [0, -1, 1.5]) {
			await expect(
				bulkInsert(asBulkDb(db), testTable, [{ name: 'test', email: 'test@example.com' }], {
					chunkSize
				})
			).rejects.toThrow(RangeError);
		}
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

	test('should quote caller-controlled table and column identifiers', async () => {
		const db = createMockDb();
		await bulkUpdate(asBulkDb(db), 'users"; DROP TABLE audit; --', [
			{ id: 'record-1', 'name"; DROP TABLE audit; --': 'safe-value' }
		]);
		const query = new PgDialect().sqlToQuery(db.queries[0] as SQL);
		expect(query.sql).toContain('UPDATE "users""; DROP TABLE audit; --"');
		expect(query.sql).toContain('"name""; DROP TABLE audit; --" = $1');
		expect(query.params).toEqual(['safe-value', 'record-1']);
	});

	test('should skip id-only no-op updates without executing SQL', async () => {
		const db = createMockDb();
		const result = await bulkUpdate(asBulkDb(db), 'test', [{ id: 'record-1' }]);
		expect(result).toBe(0);
		expect(db.queries).toEqual([]);
	});

	test('should reject a fractional chunk size', async () => {
		const db = createMockDb();
		for (const chunkSize of [0, -1, 1.5]) {
			await expect(
				bulkUpdate(asBulkDb(db), 'test', [{ id: '1', name: 'updated' }], { chunkSize })
			).rejects.toThrow(RangeError);
		}
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

	test('should use physical database names in EXCLUDED update expressions', async () => {
		const mappedTable = pgTable('mapped', {
			id: uuid('id').primaryKey(),
			displayName: text('display_name')
		});
		let updateConfig: unknown;
		const db = {
			insert: () => ({
				values: () => ({
					onConflictDoUpdate: (config: unknown) => {
						updateConfig = config;
						return { rowCount: 1 };
					}
				})
			})
		};
		await bulkUpsert(
			db as unknown as Parameters<typeof bulkUpsert>[0],
			mappedTable,
			[{ id: 'record-1', displayName: 'Example' }],
			'id',
			['displayName']
		);
		const set = (updateConfig as { set: { displayName?: SQL } }).set;
		const compiled = new PgDialect().sqlToQuery(set.displayName!);
		expect(compiled.sql).toBe('EXCLUDED."display_name"');
	});

	test('should reject a fractional chunk size', async () => {
		const db = createMockDb();
		for (const chunkSize of [0, -1, 1.5]) {
			await expect(
				bulkUpsert(
					asBulkDb(db),
					testTable,
					[{ name: 'test', email: 'test@example.com' }] as Parameters<typeof bulkUpsert>[2],
					'id' as Parameters<typeof bulkUpsert>[3],
					['name'] as Parameters<typeof bulkUpsert>[4],
					{ chunkSize }
				)
			).rejects.toThrow(RangeError);
		}
	});
});
