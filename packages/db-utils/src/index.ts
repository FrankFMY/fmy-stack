/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
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
	type PaginationParams,
	type PaginatedResult
} from './query/paginate.js';

export { buildSearchFilter, type SearchConfig } from './query/search.js';

export { withSoftDelete, type SoftDeleteOptions } from './query/softDelete.js';

// Transaction Helpers
export { runTransaction, type TransactionCallback } from './transaction/runTransaction.js';

// Bulk Operations
export {
	bulkInsert,
	bulkUpdate,
	bulkUpsert,
	type BulkOptions
} from './bulk/operations.js';

// Seed Helpers
export { createSeeder, type SeederConfig } from './seed/seeder.js';
