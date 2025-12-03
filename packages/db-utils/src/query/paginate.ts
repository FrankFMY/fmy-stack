/**
 * @fileoverview FrankFMY Platform — Initiative Development
 * @author Artyom Pryanishnikov | @license PolyForm-Shield-1.0.0
 */

import { sql, type SQL } from 'drizzle-orm';
import type { PgTable, PgSelect } from 'drizzle-orm/pg-core';

export interface PaginationParams {
	page?: number;
	limit?: number;
	maxLimit?: number;
}

export interface PaginatedResult<T> {
	data: T[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

/**
 * Apply pagination to a Drizzle query
 */
export function paginate<T extends PgSelect>(
	query: T,
	params: PaginationParams = {}
): T {
	const { page = 1, limit = 20, maxLimit = 100 } = params;

	const safePage = Math.max(1, page);
	const safeLimit = Math.min(Math.max(1, limit), maxLimit);
	const offset = (safePage - 1) * safeLimit;

	return query.limit(safeLimit).offset(offset) as T;
}

/**
 * Build paginated result with metadata
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
 * Get count query for pagination
 */
export function getCountSql(table: PgTable): SQL {
	return sql`SELECT COUNT(*) as count FROM ${table}`;
}

