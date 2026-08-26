/**
 * @fileoverview FMY Stack
 * @author Artem Prianishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2026 Artem Prianishnikov
 * @license Apache-2.0
 *
 * Базовые схемы для Drizzle ORM (PostgreSQL)
 */

import { sql } from 'drizzle-orm';
import { boolean, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * Базовые колонки для сущностей PostgreSQL.
 * Включает: id (UUID с автогенерацией), createdAt, updatedAt (с автообновлением).
 * @example
 * import { pgTable, text } from 'drizzle-orm/pg-core';
 * import { baseEntityColumns } from '@frankfmy/db-utils';
 *
 * const users = pgTable('users', {
 *   ...baseEntityColumns,
 *   name: text('name').notNull()
 * });
 */
export const baseEntityColumns = {
	id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date())
};

/**
 * Колонки временных меток (без id).
 * Включает: createdAt, updatedAt (с автообновлением).
 * Полезно для join-таблиц или таблиц без первичного ключа.
 * @example
 * const userRoles = pgTable('user_roles', {
 *   ...timestampColumns,
 *   userId: uuid('user_id').notNull(),
 *   roleId: uuid('role_id').notNull()
 * });
 */
export const timestampColumns = {
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date())
};

/**
 * Колонки для мягкого удаления (soft delete).
 * Включает: deletedAt (timestamp, nullable), isDeleted (boolean, default: false).
 * @example
 * const posts = pgTable('posts', {
 *   ...baseEntityColumns,
 *   ...softDeleteColumns,
 *   title: text('title').notNull()
 * });
 */
export const softDeleteColumns = {
	deletedAt: timestamp('deleted_at', { withTimezone: true }),
	isDeleted: boolean('is_deleted').default(false).notNull()
};

/**
 * Тип базовой сущности с id и временными метками.
 */
export interface BaseEntity {
	/** Уникальный идентификатор (UUID) */
	id: string;
	/** Дата создания */
	createdAt: Date;
	/** Дата последнего обновления */
	updatedAt: Date;
}

/**
 * Тип для временных меток (без id).
 */
export interface Timestamps {
	/** Дата создания */
	createdAt: Date;
	/** Дата последнего обновления */
	updatedAt: Date;
}

/**
 * Тип для сущности с поддержкой мягкого удаления.
 */
export interface SoftDeletable {
	/** Дата удаления (null если не удалено) */
	deletedAt: Date | null;
	/** Флаг удаления */
	isDeleted: boolean;
}
