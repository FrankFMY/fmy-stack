/**
 * @fileoverview FMY Stack
 * @author Artem Prianishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2026 Artem Prianishnikov
 * @license Apache-2.0
 *
 * @frankfmy/db-utils - Drizzle ORM Utilities
 */

// Schema Helpers
export {
	baseEntityColumns,
	softDeleteColumns,
	timestampColumns,
	type BaseEntity,
	type SoftDeletable,
	type Timestamps
} from './schema/baseEntity.js';

// Query Helpers
export {
	paginate,
	buildPaginatedResult,
	getCountSql,
	type PaginationParams,
	type PaginatedResult
} from './query/paginate.js';

export { buildSearchFilter, type SearchConfig } from './query/search.js';

export { withSoftDelete, type SoftDeleteOptions } from './query/softDelete.js';

// Transaction Helpers
export {
	runTransaction,
	runBatchTransaction,
	runTransactionWithRetry,
	type TransactionCallback
} from './transaction/runTransaction.js';

// Bulk Operations
export {
	bulkInsert,
	bulkUpdate,
	bulkUpsert,
	type BulkOptions
} from './bulk/operations.js';

// Seed Helpers
export { createSeeder, type SeederConfig } from './seed/seeder.js';
