/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * Утилиты для работы с мягким удалением (soft delete) в Drizzle ORM
 */

import { eq, isNull, isNotNull, and, type SQL, type Column } from 'drizzle-orm';

/**
 * Опции для работы с мягким удалением.
 */
export interface SoftDeleteOptions {
	/** Колонка с датой удаления (deletedAt) */
	deletedAtColumn: Column;
	/** Опциональная колонка с флагом удаления (isDeleted) */
	isDeletedColumn?: Column;
}

/**
 * Строит фильтр для исключения мягко удаленных записей.
 * Используется для получения только активных (не удаленных) записей.
 * @param options - Опции с колонками для мягкого удаления
 * @returns SQL условие для исключения удаленных записей
 * @example
 * const activeUsers = await db
 *   .select()
 *   .from(users)
 *   .where(and(
 *     eq(users.active, true),
 *     withSoftDelete({ deletedAtColumn: users.deletedAt, isDeletedColumn: users.isDeleted })
 *   ));
 */
export function withSoftDelete(options: SoftDeleteOptions): SQL {
	const { deletedAtColumn, isDeletedColumn } = options;

	if (isDeletedColumn) {
		return and(isNull(deletedAtColumn), eq(isDeletedColumn, false))!;
	}

	return isNull(deletedAtColumn);
}

/**
 * Строит фильтр для получения только мягко удаленных записей.
 * Используется для восстановления записей или их окончательного удаления.
 * @param options - Опции с колонками для мягкого удаления
 * @returns SQL условие для получения только удаленных записей
 * @example
 * const deletedUsers = await db
 *   .select()
 *   .from(users)
 *   .where(onlyDeleted({ deletedAtColumn: users.deletedAt, isDeletedColumn: users.isDeleted }));
 */
export function onlyDeleted(options: SoftDeleteOptions): SQL {
	const { deletedAtColumn, isDeletedColumn } = options;

	if (isDeletedColumn) {
		return eq(isDeletedColumn, true);
	}

	return isNotNull(deletedAtColumn);
}

/**
 * Получает значения для мягкого удаления записи.
 * Используется при обновлении записи для пометки её как удаленной.
 * @returns Объект с датой удаления и флагом удаления
 * @example
 * await db
 *   .update(users)
 *   .set(getSoftDeleteValues())
 *   .where(eq(users.id, userId));
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
 * Получает значения для восстановления мягко удаленной записи.
 * Используется при обновлении записи для восстановления.
 * @returns Объект с null для deletedAt и false для isDeleted
 * @example
 * await db
 *   .update(users)
 *   .set(getRestoreValues())
 *   .where(eq(users.id, userId));
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
