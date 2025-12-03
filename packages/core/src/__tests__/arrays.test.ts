/**
 * @fileoverview Tests for array utilities
 */

import { describe, expect, test } from 'bun:test';
import {
	unique,
	uniqueBy,
	shuffle,
	groupBy,
	groupByFn,
	sortBy,
	chunk,
	flatten,
	flattenDeep,
	difference,
	intersection,
	union,
	first,
	last,
	sample,
	sampleN,
	countBy,
	sum,
	average,
	median,
	min,
	max,
	minBy,
	maxBy,
	keyBy,
	range,
	isEmpty,
	isNotEmpty,
	compact,
	zip,
	partition
} from '../arrays/index.js';

describe('unique', () => {
	test('should remove duplicates', () => {
		expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
		expect(unique(['a', 'b', 'a'])).toEqual(['a', 'b']);
	});

	test('should handle empty array', () => {
		expect(unique([])).toEqual([]);
	});
});

describe('uniqueBy', () => {
	test('should remove duplicates by key', () => {
		const items = [
			{ id: 1, name: 'a' },
			{ id: 2, name: 'b' },
			{ id: 1, name: 'c' }
		];
		expect(uniqueBy(items, 'id')).toEqual([
			{ id: 1, name: 'a' },
			{ id: 2, name: 'b' }
		]);
	});
});

describe('shuffle', () => {
	test('should return array of same length', () => {
		const arr = [1, 2, 3, 4, 5];
		const shuffled = shuffle(arr);
		expect(shuffled).toHaveLength(5);
		expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
	});

	test('should not mutate original array', () => {
		const arr = [1, 2, 3];
		shuffle(arr);
		expect(arr).toEqual([1, 2, 3]);
	});
});

describe('groupBy', () => {
	test('should group by key', () => {
		const items = [
			{ category: 'a', value: 1 },
			{ category: 'b', value: 2 },
			{ category: 'a', value: 3 }
		];
		expect(groupBy(items, 'category')).toEqual({
			a: [
				{ category: 'a', value: 1 },
				{ category: 'a', value: 3 }
			],
			b: [{ category: 'b', value: 2 }]
		});
	});
});

describe('groupByFn', () => {
	test('should group by function', () => {
		const numbers = [1, 2, 3, 4, 5];
		expect(groupByFn(numbers, (n) => (n % 2 === 0 ? 'even' : 'odd'))).toEqual({
			odd: [1, 3, 5],
			even: [2, 4]
		});
	});
});

describe('sortBy', () => {
	test('should sort ascending by default', () => {
		const items = [{ age: 30 }, { age: 20 }, { age: 25 }];
		expect(sortBy(items, 'age')).toEqual([{ age: 20 }, { age: 25 }, { age: 30 }]);
	});

	test('should sort descending', () => {
		const items = [{ age: 30 }, { age: 20 }, { age: 25 }];
		expect(sortBy(items, 'age', 'desc')).toEqual([{ age: 30 }, { age: 25 }, { age: 20 }]);
	});

	test('should not mutate original array', () => {
		const items = [{ age: 30 }, { age: 20 }];
		sortBy(items, 'age');
		expect(items).toEqual([{ age: 30 }, { age: 20 }]);
	});
});

describe('chunk', () => {
	test('should split into chunks', () => {
		expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
	});

	test('should handle size larger than array', () => {
		expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
	});

	test('should return empty array for invalid size', () => {
		expect(chunk([1, 2, 3], 0)).toEqual([]);
		expect(chunk([1, 2, 3], -1)).toEqual([]);
	});
});

describe('flatten', () => {
	test('should flatten one level', () => {
		expect(flatten([[1, 2], [3, 4], [5]])).toEqual([1, 2, 3, 4, 5]);
	});
});

describe('flattenDeep', () => {
	test('should flatten deeply nested', () => {
		expect(flattenDeep([1, [2, [3, [4]]]])).toEqual([1, 2, 3, 4]);
	});
});

describe('difference', () => {
	test('should return elements in first but not second', () => {
		expect(difference([1, 2, 3, 4], [2, 4])).toEqual([1, 3]);
	});
});

describe('intersection', () => {
	test('should return common elements', () => {
		expect(intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3]);
	});
});

describe('union', () => {
	test('should return unique elements from all arrays', () => {
		expect(union([1, 2], [2, 3], [3, 4])).toEqual([1, 2, 3, 4]);
	});
});

describe('first and last', () => {
	test('should return first element', () => {
		expect(first([1, 2, 3])).toBe(1);
		expect(first([])).toBeUndefined();
	});

	test('should return last element', () => {
		expect(last([1, 2, 3])).toBe(3);
		expect(last([])).toBeUndefined();
	});
});

describe('sample and sampleN', () => {
	test('should return random element', () => {
		const arr = [1, 2, 3, 4, 5];
		const s = sample(arr);
		expect(arr).toContain(s);
	});

	test('should return empty for empty array', () => {
		expect(sample([])).toBeUndefined();
	});

	test('should return N random elements', () => {
		const arr = [1, 2, 3, 4, 5];
		const samples = sampleN(arr, 3);
		expect(samples).toHaveLength(3);
		samples.forEach((s) => expect(arr).toContain(s));
	});
});

describe('countBy', () => {
	test('should count matching elements', () => {
		expect(countBy([1, 2, 3, 4, 5], (n) => n > 2)).toBe(3);
	});
});

describe('sum, average, median', () => {
	test('should calculate sum', () => {
		expect(sum([1, 2, 3, 4])).toBe(10);
		expect(sum([])).toBe(0);
	});

	test('should calculate average', () => {
		expect(average([1, 2, 3, 4])).toBe(2.5);
		expect(average([])).toBe(0);
	});

	test('should calculate median', () => {
		expect(median([1, 2, 3])).toBe(2);
		expect(median([1, 2, 3, 4])).toBe(2.5);
		expect(median([])).toBe(0);
	});
});

describe('min, max, minBy, maxBy', () => {
	test('should find min/max', () => {
		expect(min([3, 1, 4, 1, 5])).toBe(1);
		expect(max([3, 1, 4, 1, 5])).toBe(5);
	});

	test('should handle empty arrays', () => {
		expect(min([])).toBe(Infinity);
		expect(max([])).toBe(-Infinity);
	});

	test('should find min/max by key', () => {
		const items = [{ age: 30 }, { age: 20 }, { age: 25 }];
		expect(minBy(items, 'age')).toEqual({ age: 20 });
		expect(maxBy(items, 'age')).toEqual({ age: 30 });
	});
});

describe('keyBy', () => {
	test('should create object keyed by property', () => {
		const items = [
			{ id: '1', name: 'a' },
			{ id: '2', name: 'b' }
		];
		expect(keyBy(items, 'id')).toEqual({
			'1': { id: '1', name: 'a' },
			'2': { id: '2', name: 'b' }
		});
	});
});

describe('range', () => {
	test('should generate range', () => {
		expect(range(0, 5)).toEqual([0, 1, 2, 3, 4]);
		expect(range(0, 10, 2)).toEqual([0, 2, 4, 6, 8]);
	});
});

describe('isEmpty and isNotEmpty', () => {
	test('should check if empty', () => {
		expect(isEmpty([])).toBe(true);
		expect(isEmpty([1])).toBe(false);
	});

	test('should check if not empty', () => {
		expect(isNotEmpty([])).toBe(false);
		expect(isNotEmpty([1])).toBe(true);
	});
});

describe('compact', () => {
	test('should remove falsy values', () => {
		expect(compact([0, 1, false, 2, '', 3, null, undefined])).toEqual([1, 2, 3]);
	});
});

describe('zip', () => {
	test('should zip two arrays', () => {
		expect(zip([1, 2, 3], ['a', 'b', 'c'])).toEqual([
			[1, 'a'],
			[2, 'b'],
			[3, 'c']
		]);
	});

	test('should handle different lengths', () => {
		expect(zip([1, 2], ['a', 'b', 'c'])).toEqual([
			[1, 'a'],
			[2, 'b']
		]);
	});
});

describe('partition', () => {
	test('should split by predicate', () => {
		const [evens, odds] = partition([1, 2, 3, 4, 5], (n) => n % 2 === 0);
		expect(evens).toEqual([2, 4]);
		expect(odds).toEqual([1, 3, 5]);
	});
});

