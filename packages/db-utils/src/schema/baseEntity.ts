/**
 * @fileoverview FrankFMY Platform — Initiative Development
 * @author Artyom Pryanishnikov | @license PolyForm-Shield-1.0.0
 */

import { sql } from 'drizzle-orm';
import { uuid, timestamp, boolean } from 'drizzle-orm/pg-core';

/**
 * Base entity columns for PostgreSQL tables
 * Includes: id (UUID), createdAt, updatedAt
 */
export const baseEntityColumns = {
	id: uuid('id')
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	createdAt: timestamp('created_at', { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date())
};

/**
 * Timestamp columns only
 */
export const timestampColumns = {
	createdAt: timestamp('created_at', { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date())
};

/**
 * Soft delete columns
 */
export const softDeleteColumns = {
	deletedAt: timestamp('deleted_at', { withTimezone: true }),
	isDeleted: boolean('is_deleted').default(false).notNull()
};

/**
 * Type for base entity
 */
export interface BaseEntity {
	id: string;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Type for timestamps
 */
export interface Timestamps {
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Type for soft deletable entity
 */
export interface SoftDeletable {
	deletedAt: Date | null;
	isDeleted: boolean;
}

