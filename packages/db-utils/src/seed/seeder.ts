/**
 * @fileoverview FrankFMY Platform — Initiative Development
 * @author Artyom Pryanishnikov | @license PolyForm-Shield-1.0.0
 */

import type { PgDatabase, PgTable, PgInsertValue } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export interface SeederConfig<TTable extends PgTable> {
	table: TTable;
	data: PgInsertValue<TTable>[] | (() => PgInsertValue<TTable>[]);
	truncate?: boolean;
	onConflict?: 'skip' | 'update';
	dependencies?: SeederConfig<any>[];
}

interface SeederResult {
	table: string;
	inserted: number;
	truncated: boolean;
}

/**
 * Create a seeder for database tables
 */
export function createSeeder<TDb extends PgDatabase<any>>(db: TDb) {
	return {
		/**
		 * Seed a single table
		 */
		async seed<TTable extends PgTable>(
			config: SeederConfig<TTable>
		): Promise<SeederResult> {
			const { table, data, truncate = false, onConflict = 'skip' } = config;
			const tableName = getTableName(table);

			// Truncate if requested
			if (truncate) {
				await db.execute(
					sql`TRUNCATE TABLE ${sql.identifier(tableName)} CASCADE`
				);
			}

			// Get data (resolve function if needed)
			const records = typeof data === 'function' ? data() : data;

			if (records.length === 0) {
				return { table: tableName, inserted: 0, truncated: truncate };
			}

			// Insert data
			let inserted = 0;

			if (onConflict === 'skip') {
				const result = await db
					.insert(table)
					.values(records)
					.onConflictDoNothing();
				inserted = (result as any).rowCount ?? records.length;
			} else {
				await db.insert(table).values(records);
				inserted = records.length;
			}

			return { table: tableName, inserted, truncated: truncate };
		},

		/**
		 * Seed multiple tables in order (with dependency resolution)
		 */
		async seedAll(
			configs: SeederConfig<any>[]
		): Promise<SeederResult[]> {
			const results: SeederResult[] = [];

			for (const config of configs) {
				// Seed dependencies first
				if (config.dependencies) {
					const depResults = await this.seedAll(config.dependencies);
					results.push(...depResults);
				}

				// Seed the table
				const result = await this.seed(config);
				results.push(result);
			}

			return results;
		},

		/**
		 * Reset database (truncate all tables)
		 */
		async reset(tables: PgTable[]): Promise<void> {
			const tableNames = tables.map(getTableName);

			await db.execute(
				sql`TRUNCATE TABLE ${sql.join(
					tableNames.map((name) => sql.identifier(name)),
					sql`, `
				)} CASCADE`
			);
		}
	};
}

/**
 * Helper to get table name from Drizzle table
 */
function getTableName(table: PgTable): string {
	return (table as any)[Symbol.for('drizzle:Name')] ?? 'unknown';
}

/**
 * Generate fake data helpers
 */
export const fakeData = {
	/**
	 * Generate a random UUID
	 */
	uuid(): string {
		return crypto.randomUUID();
	},

/**
 * Pick a random item from array
 */
pick<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)]!;
},

	/**
	 * Generate a random integer between min and max
	 */
	int(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},

	/**
	 * Generate a random boolean
	 */
	bool(): boolean {
		return Math.random() > 0.5;
	},

	/**
	 * Generate a random date between two dates
	 */
	date(start: Date, end: Date): Date {
		return new Date(
			start.getTime() + Math.random() * (end.getTime() - start.getTime())
		);
	},

	/**
	 * Generate array of n items using factory function
	 */
	array<T>(n: number, factory: (index: number) => T): T[] {
		return Array.from({ length: n }, (_, i) => factory(i));
	}
};

