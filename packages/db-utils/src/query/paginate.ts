/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * Утилиты для пагинации запросов в Drizzle ORM
 */

import { sql, type SQL } from 'drizzle-orm';
import type { PgSelect, PgTable } from 'drizzle-orm/pg-core';

/**
 * Параметры пагинации для запросов.
 */
export interface PaginationParams {
	/** Номер страницы (начинается с 1, по умолчанию 1) */
	page?: number;
	/** Количество элементов на странице (по умолчанию 20) */
	limit?: number;
	/** Максимальное количество элементов на странице (по умолчанию 100) */
	maxLimit?: number;
}

/**
 * Результат пагинации с метаданными.
 * @template T Тип элементов в массиве данных
 */
export interface PaginatedResult<T> {
	/** Массив данных для текущей страницы */
	data: T[];
	/** Метаданные пагинации */
	meta: {
		/** Текущая страница */
		page: number;
		/** Количество элементов на странице */
		limit: number;
		/** Общее количество элементов */
		total: number;
		/** Общее количество страниц */
		totalPages: number;
		/** Есть ли следующая страница */
		hasNext: boolean;
		/** Есть ли предыдущая страница */
		hasPrev: boolean;
	};
}

/**
 * Применяет пагинацию к запросу Drizzle ORM.
 * Добавляет LIMIT и OFFSET к запросу.
 * @template T Тип запроса Drizzle (PgSelect)
 * @param query - Запрос Drizzle для пагинации
 * @param params - Параметры пагинации
 * @returns Запрос с примененной пагинацией
 * @example
 * const paginatedQuery = paginate(
 *   db.select().from(users).where(eq(users.active, true)),
 *   { page: 2, limit: 10 }
 * );
 * const results = await paginatedQuery;
 */
export function paginate<T extends PgSelect>(query: T, params: PaginationParams = {}): T {
	const { page = 1, limit = 20, maxLimit = 100 } = params;

	const safePage = Math.max(1, page);
	const safeLimit = Math.min(Math.max(1, limit), maxLimit);
	const offset = (safePage - 1) * safeLimit;

	return query.limit(safeLimit).offset(offset) as T;
}

/**
 * Строит результат пагинации с метаданными.
 * Полезно для API endpoints, где нужно вернуть данные и метаинформацию.
 * @template T Тип элементов в массиве данных
 * @param data - Массив данных для текущей страницы
 * @param total - Общее количество элементов (до пагинации)
 * @param params - Параметры пагинации
 * @returns Результат пагинации с метаданными
 * @example
 * const data = await paginatedQuery;
 * const total = await countQuery;
 * const result = await buildPaginatedResult(data, total, { page: 1, limit: 20 });
 */
export async function buildPaginatedResult<T>(
	data: T[],
	total: number,
	params: PaginationParams = {}
): Promise<PaginatedResult<T>> {
	const { page = 1, limit = 20, maxLimit = 100 } = params;

	const safePage = Math.max(1, page);
	const safeLimit = Math.min(Math.max(1, limit), maxLimit);
	const totalPages = Math.ceil(total / safeLimit);

	return {
		data,
		meta: {
			page: safePage,
			limit: safeLimit,
			total,
			totalPages,
			hasNext: safePage < totalPages,
			hasPrev: safePage > 1
		}
	};
}

/**
 * Получает SQL запрос для подсчета общего количества записей.
 * Используется для получения total в пагинации.
 * @param table - Таблица Drizzle ORM
 * @returns SQL выражение для подсчета записей
 * @example
 * const countQuery = getCountSql(users);
 * const result = await db.execute(countQuery);
 * const total = Number(result.rows[0].count);
 */
export function getCountSql(table: PgTable): SQL {
	return sql`SELECT COUNT(*) as count FROM ${table}`;
}
