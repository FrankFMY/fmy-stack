/**
 * @fileoverview FrankFMY Platform — Initiative Development
 * @author Artyom Pryanishnikov | @license PolyForm-Shield-1.0.0
 */

import type { PgDatabase } from 'drizzle-orm/pg-core';

export type TransactionCallback<TDb, TResult> = (tx: TDb) => Promise<TResult>;

/**
 * Run a database transaction with automatic rollback on error
 * @param db - Drizzle database instance
 * @param callback - Transaction callback that receives the transaction object
 * @returns Result of the callback
 */
export async function runTransaction<TDb extends PgDatabase<any>, TResult>(
	db: TDb,
	callback: TransactionCallback<TDb, TResult>
): Promise<TResult> {
	return db.transaction(async (tx) => {
		return callback(tx as unknown as TDb);
	});
}

/**
 * Run multiple operations in a single transaction
 */
export async function runBatchTransaction<
	TDb extends PgDatabase<any>,
	TResult
>(
	db: TDb,
	operations: Array<TransactionCallback<TDb, unknown>>
): Promise<TResult[]> {
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
 * Retry a transaction on conflict
 */
export async function runTransactionWithRetry<
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
			await new Promise((resolve) =>
				setTimeout(resolve, retryDelay * (attempt + 1))
			);
		}
	}

	throw lastError;
}

