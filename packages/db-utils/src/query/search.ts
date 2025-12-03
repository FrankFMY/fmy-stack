/**
 * @fileoverview FrankFMY Platform — Initiative Development
 * @author Artyom Pryanishnikov | @license PolyForm-Shield-1.0.0
 */

import { sql, ilike, or, type SQL, type Column } from 'drizzle-orm';

export interface SearchConfig {
	query: string;
	columns: Column[];
	mode?: 'contains' | 'startsWith' | 'endsWith' | 'exact';
}

/**
 * Build a search filter for multiple columns
 * Uses ILIKE for case-insensitive search
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
		case 'contains':
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
 * Build full-text search filter (PostgreSQL specific)
 * Requires tsvector column
 */
export function buildFullTextSearch(
	tsVectorColumn: Column,
	query: string,
	language: string = 'russian'
): SQL {
	return sql`${tsVectorColumn} @@ plainto_tsquery(${language}, ${query})`;
}

/**
 * Build trigram similarity search (requires pg_trgm extension)
 */
export function buildTrigramSearch(
	column: Column,
	query: string,
	threshold: number = 0.3
): SQL {
	return sql`similarity(${column}, ${query}) > ${threshold}`;
}

