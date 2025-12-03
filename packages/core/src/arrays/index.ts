/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * Утилиты для работы с массивами и коллекциями
 */

/**
 * Убрать дубликаты из массива
 */
export function unique<T>(arr: T[]): T[] {
	return [...new Set(arr)];
}

/**
 * Убрать дубликаты по ключу
 */
export function uniqueBy<T>(arr: T[], key: keyof T): T[] {
	const seen = new Set<unknown>();
	return arr.filter((item) => {
		const value = item[key];
		if (seen.has(value)) {
			return false;
		}
		seen.add(value);
		return true;
	});
}

/**
 * Перемешать массив (Fisher-Yates)
 */
export function shuffle<T>(arr: T[]): T[] {
	const result = [...arr];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j]!, result[i]!];
	}
	return result;
}

/**
 * Группировать массив по ключу
 */
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
	return arr.reduce(
		(groups, item) => {
			const value = String(item[key]);
			if (!groups[value]) {
				groups[value] = [];
			}
			groups[value].push(item);
			return groups;
		},
		{} as Record<string, T[]>
	);
}

/**
 * Группировать массив по функции
 */
export function groupByFn<T>(arr: T[], fn: (item: T) => string): Record<string, T[]> {
	return arr.reduce(
		(groups, item) => {
			const key = fn(item);
			if (!groups[key]) {
				groups[key] = [];
			}
			groups[key].push(item);
			return groups;
		},
		{} as Record<string, T[]>
	);
}

/**
 * Сортировать массив по ключу
 */
export function sortBy<T>(arr: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
	const result = [...arr];
	result.sort((a, b) => {
		const aVal = a[key];
		const bVal = b[key];

		let comparison: number;
		if (typeof aVal === 'string' && typeof bVal === 'string') {
			comparison = aVal.localeCompare(bVal);
		} else {
			comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
		}

		return order === 'desc' ? -comparison : comparison;
	});
	return result;
}

/**
 * Разбить массив на чанки
 */
export function chunk<T>(arr: T[], size: number): T[][] {
	if (size <= 0) return [];
	const result: T[][] = [];
	for (let i = 0; i < arr.length; i += size) {
		result.push(arr.slice(i, i + size));
	}
	return result;
}

/**
 * Выровнять вложенный массив
 */
export function flatten<T>(arr: (T | T[])[]): T[] {
	return arr.flat() as T[];
}

/**
 * Глубоко выровнять вложенный массив
 */
export function flattenDeep<T>(arr: unknown[]): T[] {
	return arr.flat(Infinity) as T[];
}

/**
 * Получить разницу между массивами
 */
export function difference<T>(arr1: T[], arr2: T[]): T[] {
	const set2 = new Set(arr2);
	return arr1.filter((item) => !set2.has(item));
}

/**
 * Получить пересечение массивов
 */
export function intersection<T>(arr1: T[], arr2: T[]): T[] {
	const set2 = new Set(arr2);
	return arr1.filter((item) => set2.has(item));
}

/**
 * Получить объединение массивов
 */
export function union<T>(...arrays: T[][]): T[] {
	return unique(arrays.flat());
}

/**
 * Получить первый элемент
 */
export function first<T>(arr: T[]): T | undefined {
	return arr[0];
}

/**
 * Получить последний элемент
 */
export function last<T>(arr: T[]): T | undefined {
	return arr[arr.length - 1];
}

/**
 * Получить случайный элемент
 */
export function sample<T>(arr: T[]): T | undefined {
	if (arr.length === 0) return undefined;
	return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Получить N случайных элементов
 */
export function sampleN<T>(arr: T[], n: number): T[] {
	const shuffled = shuffle(arr);
	return shuffled.slice(0, n);
}

/**
 * Посчитать количество элементов по условию
 */
export function countBy<T>(arr: T[], predicate: (item: T) => boolean): number {
	return arr.filter(predicate).length;
}

/**
 * Сумма чисел
 */
export function sum(arr: number[]): number {
	return arr.reduce((acc, val) => acc + val, 0);
}

/**
 * Среднее значение
 */
export function average(arr: number[]): number {
	if (arr.length === 0) return 0;
	return sum(arr) / arr.length;
}

/**
 * Медиана
 */
export function median(arr: number[]): number {
	if (arr.length === 0) return 0;
	const sorted = [...arr].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 !== 0 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/**
 * Минимальное значение
 */
export function min(arr: number[]): number {
	if (arr.length === 0) return Infinity;
	return Math.min(...arr);
}

/**
 * Максимальное значение
 */
export function max(arr: number[]): number {
	if (arr.length === 0) return -Infinity;
	return Math.max(...arr);
}

/**
 * Найти минимальный элемент по ключу
 */
export function minBy<T>(arr: T[], key: keyof T): T | undefined {
	if (arr.length === 0) return undefined;
	return arr.reduce((min, item) => (item[key] < min[key] ? item : min));
}

/**
 * Найти максимальный элемент по ключу
 */
export function maxBy<T>(arr: T[], key: keyof T): T | undefined {
	if (arr.length === 0) return undefined;
	return arr.reduce((max, item) => (item[key] > max[key] ? item : max));
}

/**
 * Преобразовать массив в объект по ключу
 */
export function keyBy<T>(arr: T[], key: keyof T): Record<string, T> {
	return arr.reduce(
		(result, item) => {
			result[String(item[key])] = item;
			return result;
		},
		{} as Record<string, T>
	);
}

/**
 * Создать range (диапазон чисел)
 */
export function range(start: number, end: number, step = 1): number[] {
	const result: number[] = [];
	for (let i = start; i < end; i += step) {
		result.push(i);
	}
	return result;
}

/**
 * Проверить, пустой ли массив
 */
export function isEmpty<T>(arr: T[]): boolean {
	return arr.length === 0;
}

/**
 * Проверить, не пустой ли массив
 */
export function isNotEmpty<T>(arr: T[]): arr is [T, ...T[]] {
	return arr.length > 0;
}

/**
 * Удалить falsy значения
 */
export function compact<T>(arr: (T | null | undefined | false | 0 | '')[]): T[] {
	return arr.filter(Boolean) as T[];
}

/**
 * Zip два массива
 */
export function zip<A, B>(arr1: A[], arr2: B[]): [A, B][] {
	const length = Math.min(arr1.length, arr2.length);
	const result: [A, B][] = [];
	for (let i = 0; i < length; i++) {
		result.push([arr1[i]!, arr2[i]!]);
	}
	return result;
}

/**
 * Partition - разделить массив на два по условию
 */
export function partition<T>(arr: T[], predicate: (item: T) => boolean): [T[], T[]] {
	const truthy: T[] = [];
	const falsy: T[] = [];
	for (const item of arr) {
		if (predicate(item)) {
			truthy.push(item);
		} else {
			falsy.push(item);
		}
	}
	return [truthy, falsy];
}

