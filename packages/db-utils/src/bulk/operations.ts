/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * Утилиты для массовых операций в Drizzle ORM
 */

import { sql } from 'drizzle-orm';
import type { PgDatabase, PgInsertValue, PgTable } from 'drizzle-orm/pg-core';

/**
 * Тип для результата Drizzle insert операции с возможным rowCount.
 */
interface DrizzleInsertResult {
	rowCount?: number;
}

/**
 * Опции для массовых операций.
 */
export interface BulkOptions {
	/** Размер чанка для обработки (по умолчанию 1000) */
	chunkSize?: number;
	/** Пропускать дубликаты при вставке (по умолчанию false) */
	skipDuplicates?: boolean;
}

/**
 * Выполняет массовую вставку данных с разбивкой на чанки.
 * Полезно для вставки больших объемов данных без перегрузки базы данных.
 * @template TDb Тип объекта базы данных
 * @template TTable Тип таблицы Drizzle ORM
 * @param db - Экземпляр базы данных Drizzle ORM
 * @param table - Таблица для вставки данных
 * @param data - Массив данных для вставки
 * @param options - Опции массовой вставки
 * @returns Количество вставленных записей
 * @example
 * const inserted = await bulkInsert(db, users, [
 *   { name: 'John', email: 'john@example.com' },
 *   { name: 'Jane', email: 'jane@example.com' }
 * ], { chunkSize: 500, skipDuplicates: true });
 */
export async function bulkInsert<
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle ORM requires any for PgDatabase generic parameter
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
			const result = (await db
				.insert(table)
				.values(chunk)
				.onConflictDoNothing()) as DrizzleInsertResult;
			inserted += result.rowCount ?? chunk.length;
		} else {
			await db.insert(table).values(chunk);
			inserted += chunk.length;
		}
	}

	return inserted;
}

/**
 * Выполняет массовое обновление данных с разбивкой на чанки.
 * Каждый чанк обрабатывается в отдельной транзакции.
 * **Примечание**: Это упрощенная версия. Для сложных обновлений используйте транзакции напрямую.
 * @template TDb Тип объекта базы данных
 * @param db - Экземпляр базы данных Drizzle ORM
 * @param tableName - Имя таблицы для обновления
 * @param data - Массив объектов с id и полями для обновления
 * @param options - Опции массового обновления
 * @returns Количество обновленных записей
 * @example
 * const updated = await bulkUpdate(db, 'users', [
 *   { id: 'uuid1', name: 'John Updated', email: 'new@example.com' },
 *   { id: 'uuid2', name: 'Jane Updated' }
 * ], { chunkSize: 500 });
 */
export async function bulkUpdate<
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle ORM requires any for PgDatabase generic parameter
	TDb extends PgDatabase<any>
>(
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
 * Выполняет массовую операцию upsert (вставка или обновление при конфликте).
 * Если запись с указанным ключом конфликта существует, она обновляется, иначе вставляется новая.
 * @template TDb Тип объекта базы данных
 * @template TTable Тип таблицы Drizzle ORM
 * @param db - Экземпляр базы данных Drizzle ORM
 * @param table - Таблица для upsert операции
 * @param data - Массив данных для вставки/обновления
 * @param conflictTarget - Колонка, по которой определяется конфликт (unique constraint)
 * @param updateColumns - Колонки для обновления при конфликте
 * @param options - Опции массового upsert
 * @returns Количество обработанных записей (вставленных или обновленных)
 * @example
 * const upserted = await bulkUpsert(
 *   db,
 *   users,
 *   [{ email: 'john@example.com', name: 'John' }],
 *   'email', // конфликт по email
 *   ['name'] // обновлять только name при конфликте
 * );
 */
export async function bulkUpsert<
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle ORM requires any for PgDatabase generic parameter
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
				(acc as Record<string, unknown>)[col as string] =
					sql`EXCLUDED.${sql.identifier(col as string)}`;
				return acc;
			},
			{} as Record<string, unknown>
		);

		// Безопасный доступ к колонке таблицы для conflict target
		// biome-ignore lint/suspicious/noExplicitAny: Dynamic property access for Drizzle conflict target
		const conflictColumn = (table as Record<string, any>)[conflictTarget as string];

		const result = (await db.insert(table).values(chunk).onConflictDoUpdate({
			target: conflictColumn,
			set: updateSet
		})) as DrizzleInsertResult;

		upserted += result.rowCount ?? chunk.length;
	}

	return upserted;
}

/**
 * Вспомогательная функция для разбивки массива на чанки заданного размера.
 * @template T Тип элементов массива
 * @param array - Исходный массив
 * @param size - Размер каждого чанка
 * @returns Массив чанков
 */
function chunkArray<T>(array: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size));
	}
	return chunks;
}
