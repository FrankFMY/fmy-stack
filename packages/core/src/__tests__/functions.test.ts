/**
 * @fileoverview Tests for function utilities
 */

import { describe, expect, test, mock, beforeEach, afterEach } from 'bun:test';
import {
	debounce,
	debounceImmediate,
	throttle,
	throttleWithTrailing,
	memoize,
	once,
	noop,
	identity,
	compose,
	pipe,
	sleep,
	retry
} from '../functions/index.js';

describe('debounce', () => {
	test('should delay function call', async () => {
		let callCount = 0;
		const fn = debounce(() => {
			callCount++;
		}, 50);

		fn();
		fn();
		fn();

		expect(callCount).toBe(0);

		await sleep(100);
		expect(callCount).toBe(1);
	});
});

describe('throttle', () => {
	test('should limit function calls', async () => {
		let callCount = 0;
		const fn = throttle(() => {
			callCount++;
		}, 50);

		fn();
		fn();
		fn();

		expect(callCount).toBe(1);

		await sleep(100);
		fn();
		expect(callCount).toBe(2);
	});
});

describe('memoize', () => {
	test('should cache results', () => {
		let callCount = 0;
		const expensive = memoize((n: number) => {
			callCount++;
			return n * 2;
		});

		expect(expensive(5)).toBe(10);
		expect(expensive(5)).toBe(10);
		expect(expensive(5)).toBe(10);
		expect(callCount).toBe(1);

		expect(expensive(10)).toBe(20);
		expect(callCount).toBe(2);
	});
});

describe('once', () => {
	test('should only call function once', () => {
		let callCount = 0;
		const fn = once(() => {
			callCount++;
			return 'result';
		});

		expect(fn()).toBe('result');
		expect(fn()).toBe('result');
		expect(fn()).toBe('result');
		expect(callCount).toBe(1);
	});
});

describe('noop', () => {
	test('should do nothing', () => {
		expect(noop()).toBeUndefined();
	});
});

describe('identity', () => {
	test('should return argument as-is', () => {
		expect(identity(5)).toBe(5);
		expect(identity('hello')).toBe('hello');
		const obj = { a: 1 };
		expect(identity(obj)).toBe(obj);
	});
});

describe('compose', () => {
	test('should compose functions right to left', () => {
		const addOne = (x: number) => x + 1;
		const double = (x: number) => x * 2;
		const addOneThenDouble = compose(double, addOne);

		expect(addOneThenDouble(5)).toBe(12); // (5 + 1) * 2 = 12
	});
});

describe('pipe', () => {
	test('should pipe functions left to right', () => {
		const addOne = (x: number) => x + 1;
		const double = (x: number) => x * 2;
		const addOneThenDouble = pipe(addOne, double);

		expect(addOneThenDouble(5)).toBe(12); // (5 + 1) * 2 = 12
	});
});

describe('sleep', () => {
	test('should delay execution', async () => {
		const start = Date.now();
		await sleep(50);
		const elapsed = Date.now() - start;
		expect(elapsed).toBeGreaterThanOrEqual(45);
	});
});

describe('retry', () => {
	test('should return result on success', async () => {
		const fn = async () => 'success';
		const result = await retry(fn);
		expect(result).toBe('success');
	});

	test('should retry on failure', async () => {
		let attempts = 0;
		const fn = async () => {
			attempts++;
			if (attempts < 3) throw new Error('fail');
			return 'success';
		};

		const result = await retry(fn, 3, 10);
		expect(result).toBe('success');
		expect(attempts).toBe(3);
	});

	test('should throw after max retries', async () => {
		const fn = async () => {
			throw new Error('always fails');
		};

		await expect(retry(fn, 2, 10)).rejects.toThrow('always fails');
	});
});

