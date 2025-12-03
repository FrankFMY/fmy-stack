/**
 * @fileoverview FrankFMY Platform — Initiative Development
 * @author Artyom Pryanishnikov | @license PolyForm-Shield-1.0.0
 */

import type { PgDatabase, PgTable, PgInsertValue } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export interface BulkOptions {
	chunkSize?: number;
	skipDuplicates?: boolean;
}

/**
 * Bulk insert with chunking for large datasets
 */
export async function bulkInsert<
	TDb extends PgDatabase<any>,
	TTable extends PgTable
>(
	db: TDb,
	table: TTable,
	data: PgInsertValue<TTable>[],
	options: BulkOptions = {}
): Promise<number> {
	const { chunkSize = 1000, skipDuplicates = false } = options;

	if (data.length === 0) {
		return 0;
	}

	let inserted = 0;
	const chunks = chunkArray(data, chunkSize);

	for (const chunk of chunks) {
		if (skipDuplicates) {
			const result = await db.insert(table).values(chunk).onConflictDoNothing();
			inserted += (result as any).rowCount ?? chunk.length;
		} else {
			await db.insert(table).values(chunk);
			inserted += chunk.length;
		}
	}

	return inserted;
}

/**
 * Bulk update with chunking
 * Note: This is a simplified version. For complex updates, use transactions.
 */
export async function bulkUpdate<TDb extends PgDatabase<any>>(
	db: TDb,
	tableName: string,
	data: Array<{ id: string; [key: string]: unknown }>,
	options: BulkOptions = {}
): Promise<number> {
	const { chunkSize = 500 } = options;

	if (data.length === 0) {
		return 0;
	}

	let updated = 0;
	const chunks = chunkArray(data, chunkSize);

	for (const chunk of chunks) {
		await db.transaction(async (tx) => {
			for (const item of chunk) {
				const { id, ...values } = item;
				const setClauses = Object.entries(values)
					.map(([key, value]) => sql`${sql.identifier(key)} = ${value}`)
					.reduce((acc, clause) => sql`${acc}, ${clause}`);

				await tx.execute(sql`
					UPDATE ${sql.identifier(tableName)}
					SET ${setClauses}
					WHERE id = ${id}
				`);
				updated++;
			}
		});
	}

	return updated;
}

/**
 * Bulk upsert (insert or update on conflict)
 */
export async function bulkUpsert<
	TDb extends PgDatabase<any>,
	TTable extends PgTable
>(
	db: TDb,
	table: TTable,
	data: PgInsertValue<TTable>[],
	conflictTarget: keyof PgInsertValue<TTable>,
	updateColumns: Array<keyof PgInsertValue<TTable>>,
	options: BulkOptions = {}
): Promise<number> {
	const { chunkSize = 1000 } = options;

	if (data.length === 0) {
		return 0;
	}

	let upserted = 0;
	const chunks = chunkArray(data, chunkSize);

	for (const chunk of chunks) {
		const updateSet = updateColumns.reduce(
			(acc, col) => {
				(acc as Record<string, unknown>)[col as string] = sql`EXCLUDED.${sql.identifier(col as string)}`;
				return acc;
			},
			{} as Record<string, unknown>
		);

		const result = await db
			.insert(table)
			.values(chunk)
			.onConflictDoUpdate({
				target: (table as any)[conflictTarget],
				set: updateSet
			});

		upserted += (result as any).rowCount ?? chunk.length;
	}

	return upserted;
}

/**
 * Helper function to chunk an array
 */
function chunkArray<T>(array: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size));
	}
	return chunks;
}

