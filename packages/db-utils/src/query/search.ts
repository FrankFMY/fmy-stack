/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * Утилиты для поиска и фильтрации в Drizzle ORM
 */

import { ilike, or, sql, type Column, type SQL } from 'drizzle-orm';

/**
 * Конфигурация поиска по нескольким колонкам.
 */
export interface SearchConfig {
	/** Поисковый запрос */
	query: string;
	/** Колонки, по которым выполняется поиск */
	columns: Column[];
	/** Режим поиска (по умолчанию 'contains') */
	mode?: 'contains' | 'startsWith' | 'endsWith' | 'exact';
}

/**
 * Строит фильтр поиска для нескольких колонок.
 * Использует ILIKE для поиска без учета регистра.
 * Если запрос пустой, возвращает undefined (фильтр не применяется).
 * @param config - Конфигурация поиска
 * @returns SQL условие для поиска или undefined, если запрос пустой
 * @example
 * const filter = buildSearchFilter({
 *   query: 'john',
 *   columns: [users.name, users.email],
 *   mode: 'contains'
 * });
 * const results = await db.select().from(users).where(filter);
 */
export function buildSearchFilter(config: SearchConfig): SQL | undefined {
	const { query, columns, mode = 'contains' } = config;

	if (!query?.trim()) {
		return undefined;
	}

	const searchTerm = query.trim();
	let pattern: string;

	switch (mode) {
		case 'startsWith':
			pattern = `${searchTerm}%`;
			break;
		case 'endsWith':
			pattern = `%${searchTerm}`;
			break;
		case 'exact':
			pattern = searchTerm;
			break;
		default:
			pattern = `%${searchTerm}%`;
	}

	const conditions = columns.map((column) => ilike(column, pattern));

	if (conditions.length === 0) {
		return undefined;
	}

	if (conditions.length === 1) {
		return conditions[0];
	}

	return or(...conditions);
}

/**
 * Строит фильтр полнотекстового поиска (специфично для PostgreSQL).
 * Требует наличие tsvector колонки в таблице.
 * @param tsVectorColumn - Колонка типа tsvector для полнотекстового поиска
 * @param query - Поисковый запрос
 * @param language - Язык для поиска (по умолчанию 'russian')
 * @returns SQL условие для полнотекстового поиска
 * @example
 * const filter = buildFullTextSearch(posts.searchVector, 'привет мир', 'russian');
 * const results = await db.select().from(posts).where(filter);
 */
export function buildFullTextSearch(
	tsVectorColumn: Column,
	query: string,
	language: string = 'russian'
): SQL {
	return sql`${tsVectorColumn} @@ plainto_tsquery(${language}, ${query})`;
}

/**
 * Строит фильтр поиска по триграммам (требует расширение pg_trgm).
 * Полезно для нечеткого поиска (fuzzy search).
 * @param column - Колонка для поиска
 * @param query - Поисковый запрос
 * @param threshold - Порог сходства от 0 до 1 (по умолчанию 0.3)
 * @returns SQL условие для поиска по триграммам
 * @example
 * const filter = buildTrigramSearch(users.name, 'jonh', 0.3); // Найдет 'John' несмотря на опечатку
 * const results = await db.select().from(users).where(filter);
 */
export function buildTrigramSearch(column: Column, query: string, threshold: number = 0.3): SQL {
	return sql`similarity(${column}, ${query}) > ${threshold}`;
}
