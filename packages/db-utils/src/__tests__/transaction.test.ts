/**
 * @fileoverview Tests for transaction utilities
 */

import { describe, expect, test } from 'bun:test';
import { runBatchTransaction, runTransaction, runTransactionWithRetry } from '../transaction/runTransaction.js';

interface MockDb {
	transaction<T>(callback: (tx: MockDb) => Promise<T>): Promise<T>;
}

function createMockDb(): MockDb {
	const db: MockDb = {
		transaction<T>(callback: (tx: MockDb) => Promise<T>): Promise<T> {
			return callback(db);
		}
	};
	return db;
}

describe('runTransaction', () => {
	test('should execute transaction callback', async () => {
		const db = createMockDb();
		let executed = false;
		await runTransaction(db as Parameters<typeof runTransaction>[0], async (tx) => {
			executed = true;
			expect(tx).toBeDefined();
			return 'success';
		});
		expect(executed).toBe(true);
	});

	test('should return result from callback', async () => {
		const db = createMockDb();
		const result = await runTransaction(db as Parameters<typeof runTransaction>[0], async () => {
			return { id: 1, name: 'test' };
		});
		expect(result).toEqual({ id: 1, name: 'test' });
	});

	test('should propagate errors', async () => {
		const db = createMockDb();
		await expect(
			runTransaction(db as Parameters<typeof runTransaction>[0], async () => {
				throw new Error('Transaction failed');
			})
		).rejects.toThrow('Transaction failed');
	});
});

describe('runBatchTransaction', () => {
	test('should execute all operations in batch', async () => {
		const db = createMockDb();
		const results: number[] = [];
		const batchResults = await runBatchTransaction(db as Parameters<typeof runBatchTransaction>[0], [
			async () => { results.push(1); return 'first'; },
			async () => { results.push(2); return 'second'; }
		]);
		expect(results).toEqual([1, 2]);
		expect(batchResults).toEqual(['first', 'second']);
	});

	test('should return array of results', async () => {
		const db = createMockDb();
		const results = await runBatchTransaction(db as Parameters<typeof runBatchTransaction>[0], [
			async () => 1,
			async () => 2,
			async () => 3
		]);
		expect(results).toEqual([1, 2, 3]);
	});

	test('should propagate errors', async () => {
		const db = createMockDb();
		await expect(
			runBatchTransaction(db as Parameters<typeof runBatchTransaction>[0], [
				async () => 'first',
				async () => { throw new Error('Batch failed'); },
				async () => 'third'
			])
		).rejects.toThrow('Batch failed');
	});
});

describe('runTransactionWithRetry', () => {
	test('should execute on first attempt if successful', async () => {
		const db = createMockDb();
		let attempts = 0;
		const result = await runTransactionWithRetry(db as Parameters<typeof runTransactionWithRetry>[0], async () => {
			attempts++;
			return 'success';
		});
		expect(attempts).toBe(1);
		expect(result).toBe('success');
	});

	test('should retry on serialization errors', async () => {
		const db = createMockDb();
		let attempts = 0;
		const result = await runTransactionWithRetry(db as Parameters<typeof runTransactionWithRetry>[0], async () => {
			attempts++;
			if (attempts < 2) throw new Error('could not serialize access');
			return 'success';
		}, 3, 10);
		expect(attempts).toBe(2);
		expect(result).toBe('success');
	});

	test('should retry on deadlock errors', async () => {
		const db = createMockDb();
		let attempts = 0;
		const result = await runTransactionWithRetry(db as Parameters<typeof runTransactionWithRetry>[0], async () => {
			attempts++;
			if (attempts < 2) throw new Error('deadlock detected');
			return 'success';
		}, 3, 10);
		expect(attempts).toBe(2);
		expect(result).toBe('success');
	});

	test('should throw after max retries', async () => {
		const db = createMockDb();
		await expect(
			runTransactionWithRetry(db as Parameters<typeof runTransactionWithRetry>[0], async () => {
				throw new Error('could not serialize access');
			}, 2, 10)
		).rejects.toThrow('could not serialize access');
	});

	test('should not retry non-retryable errors', async () => {
		const db = createMockDb();
		let attempts = 0;
		await expect(
			runTransactionWithRetry(db as Parameters<typeof runTransactionWithRetry>[0], async () => {
				attempts++;
				throw new Error('Non-retryable error');
			}, 3, 10)
		).rejects.toThrow('Non-retryable error');
		expect(attempts).toBe(1);
	});
});
