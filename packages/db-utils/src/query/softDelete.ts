/**
 * @fileoverview FrankFMY Platform — Initiative Development
 * @author Artyom Pryanishnikov | @license PolyForm-Shield-1.0.0
 */

import { eq, isNull, and, type SQL, type Column } from 'drizzle-orm';

export interface SoftDeleteOptions {
	deletedAtColumn: Column;
	isDeletedColumn?: Column;
}

/**
 * Build a filter to exclude soft-deleted records
 */
export function withSoftDelete(options: SoftDeleteOptions): SQL {
	const { deletedAtColumn, isDeletedColumn } = options;

	if (isDeletedColumn) {
		return and(isNull(deletedAtColumn), eq(isDeletedColumn, false))!;
	}

	return isNull(deletedAtColumn);
}

/**
 * Build a filter to include only soft-deleted records
 */
export function onlyDeleted(options: SoftDeleteOptions): SQL {
	const { deletedAtColumn, isDeletedColumn } = options;

	if (isDeletedColumn) {
		return eq(isDeletedColumn, true);
	}

	return isNull(deletedAtColumn);
}

/**
 * Get soft delete values for updating a record
 */
export function getSoftDeleteValues(): {
	deletedAt: Date;
	isDeleted: boolean;
} {
	return {
		deletedAt: new Date(),
		isDeleted: true
	};
}

/**
 * Get restore values for restoring a soft-deleted record
 */
export function getRestoreValues(): {
	deletedAt: null;
	isDeleted: boolean;
} {
	return {
		deletedAt: null,
		isDeleted: false
	};
}

