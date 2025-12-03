/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * Утилиты для работы с транзакциями в Drizzle ORM
 */

import type { PgDatabase } from 'drizzle-orm/pg-core';

/**
 * Тип функции-колбэка для выполнения внутри транзакции.
 * @template TDb Тип объекта базы данных (транзакции)
 * @template TResult Тип возвращаемого значения
 */
export type TransactionCallback<TDb, TResult> = (tx: TDb) => Promise<TResult>;

/**
 * Выполняет транзакцию базы данных с автоматическим откатом при ошибке.
 * Все операции внутри callback выполняются атомарно - либо все успешно, либо все откатываются.
 * @template TDb Тип объекта базы данных
 * @template TResult Тип возвращаемого значения
 * @param db - Экземпляр базы данных Drizzle ORM
 * @param callback - Функция-колбэк, которая получает объект транзакции и возвращает результат
 * @returns Результат выполнения callback
 * @throws Выбрасывает ошибку при неудаче, автоматически откатывая транзакцию
 * @example
 * const result = await runTransaction(db, async (tx) => {
 *   await tx.insert(users).values({ name: 'John' });
 *   await tx.insert(posts).values({ title: 'Hello', userId: userId });
 *   return 'Success';
 * });
 */
export async function runTransaction<
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle ORM requires any for PgDatabase generic parameter
	TDb extends PgDatabase<any>,
	TResult
>(db: TDb, callback: TransactionCallback<TDb, TResult>): Promise<TResult> {
	return db.transaction(async (tx) => {
		return callback(tx as unknown as TDb);
	});
}

/**
 * Выполняет несколько операций в одной транзакции.
 * Все операции выполняются последовательно в рамках одной транзакции.
 * @template TDb Тип объекта базы данных
 * @template TResult Тип возвращаемого значения каждой операции
 * @param db - Экземпляр базы данных Drizzle ORM
 * @param operations - Массив функций для выполнения внутри транзакции
 * @returns Массив результатов выполнения всех операций
 * @throws Выбрасывает ошибку при неудаче любой операции, откатывая всю транзакцию
 * @example
 * const results = await runBatchTransaction(db, [
 *   async (tx) => await tx.insert(users).values({ name: 'John' }),
 *   async (tx) => await tx.insert(roles).values({ name: 'admin' })
 * ]);
 */
export async function runBatchTransaction<
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle ORM requires any for PgDatabase generic parameter
	TDb extends PgDatabase<any>,
	TResult
>(db: TDb, operations: Array<TransactionCallback<TDb, unknown>>): Promise<TResult[]> {
	return db.transaction(async (tx) => {
		const results: TResult[] = [];
		for (const operation of operations) {
			const result = await operation(tx as unknown as TDb);
			results.push(result as TResult);
		}
		return results;
	});
}

/**
 * Выполняет транзакцию с повторными попытками при конфликтах.
 * Автоматически повторяет транзакцию при ошибках deadlock или serialization failure.
 * Использует экспоненциальную задержку между попытками.
 * @template TDb Тип объекта базы данных
 * @template TResult Тип возвращаемого значения
 * @param db - Экземпляр базы данных Drizzle ORM
 * @param callback - Функция-колбэк для выполнения внутри транзакции
 * @param maxRetries - Максимальное количество попыток (по умолчанию 3)
 * @param retryDelay - Базовая задержка между попытками в миллисекундах (по умолчанию 100)
 * @returns Результат выполнения callback
 * @throws Выбрасывает последнюю ошибку, если все попытки неудачны
 * @example
 * const result = await runTransactionWithRetry(
 *   db,
 *   async (tx) => {
 *     // Операции с высоким риском конфликтов
 *   },
 *   5, // максимум 5 попыток
 *   200 // задержка 200ms
 * );
 */
export async function runTransactionWithRetry<
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle ORM requires any for PgDatabase generic parameter
	TDb extends PgDatabase<any>,
	TResult
>(
	db: TDb,
	callback: TransactionCallback<TDb, TResult>,
	maxRetries: number = 3,
	retryDelay: number = 100
): Promise<TResult> {
	let lastError: Error | null = null;

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			return await db.transaction(async (tx) => {
				return callback(tx as unknown as TDb);
			});
		} catch (error) {
			lastError = error as Error;

			// Check if it's a serialization/deadlock error
			const isRetryable =
				error instanceof Error &&
				(error.message.includes('deadlock') ||
					error.message.includes('serialization') ||
					error.message.includes('could not serialize'));

			if (!isRetryable || attempt === maxRetries - 1) {
				throw error;
			}

			// Wait before retrying
			await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
		}
	}

	throw lastError;
}
