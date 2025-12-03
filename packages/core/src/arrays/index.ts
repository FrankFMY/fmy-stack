/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * Утилиты для работы с массивами и коллекциями
 */

/**
 * Удаляет дубликаты из массива, используя строгое сравнение.
 * Сохраняет порядок первого вхождения каждого элемента.
 * @param arr - Исходный массив
 * @returns Новый массив без дубликатов
 * @example
 * unique([1, 2, 2, 3, 1]) // [1, 2, 3]
 * unique(['a', 'b', 'a']) // ['a', 'b']
 */
export function unique<T>(arr: T[]): T[] {
	return [...new Set(arr)];
}

/**
 * Удаляет дубликаты из массива объектов по указанному ключу.
 * Сохраняет порядок первого вхождения для каждого уникального значения ключа.
 * @param arr - Исходный массив объектов
 * @param key - Ключ объекта для сравнения
 * @returns Новый массив без дубликатов по ключу
 * @example
 * uniqueBy([{id: 1, name: 'a'}, {id: 2, name: 'a'}], 'name') // [{id: 1, name: 'a'}]
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
 * Перемешивает элементы массива случайным образом (алгоритм Fisher-Yates).
 * Создает новый массив, исходный не изменяется.
 * @param arr - Исходный массив
 * @returns Новый массив с перемешанными элементами
 * @example
 * shuffle([1, 2, 3, 4, 5]) // [3, 1, 5, 2, 4] (случайный порядок)
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
 * Группирует элементы массива по значению указанного ключа.
 * @param arr - Исходный массив объектов
 * @param key - Ключ объекта для группировки
 * @returns Объект, где ключи - значения указанного поля, значения - массивы элементов
 * @example
 * groupBy([{type: 'a', val: 1}, {type: 'b', val: 2}], 'type')
 * // { a: [{type: 'a', val: 1}], b: [{type: 'b', val: 2}] }
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
 * Группирует элементы массива по результату функции-трансформера.
 * @param arr - Исходный массив
 * @param fn - Функция, которая возвращает ключ группировки для каждого элемента
 * @returns Объект, где ключи - результаты функции, значения - массивы элементов
 * @example
 * groupByFn([1, 2, 3, 4], (n) => n % 2 === 0 ? 'even' : 'odd')
 * // { odd: [1, 3], even: [2, 4] }
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
 * Сортирует массив объектов по значению указанного ключа.
 * @param arr - Исходный массив объектов
 * @param key - Ключ объекта для сортировки
 * @param order - Порядок сортировки: 'asc' (по возрастанию) или 'desc' (по убыванию), по умолчанию 'asc'
 * @returns Новый отсортированный массив
 * @example
 * sortBy([{age: 30}, {age: 20}], 'age', 'asc') // [{age: 20}, {age: 30}]
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
 * Разбивает массив на чанки указанного размера.
 * Последний чанк может содержать меньше элементов, если массив не делится нацело.
 * @param arr - Исходный массив
 * @param size - Размер каждого чанка (должен быть положительным числом)
 * @returns Массив чанков
 * @example
 * chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
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
 * Выравнивает одномерный массив, удаляя один уровень вложенности.
 * @param arr - Массив, который может содержать вложенные массивы
 * @returns Одномерный массив
 * @example
 * flatten([1, [2, 3], [4]]) // [1, 2, 3, 4]
 */
export function flatten<T>(arr: (T | T[])[]): T[] {
	return arr.flat() as T[];
}

/**
 * Глубоко выравнивает многомерный массив до одномерного.
 * Удаляет все уровни вложенности.
 * @param arr - Многомерный массив
 * @returns Одномерный массив
 * @example
 * flattenDeep([1, [2, [3, 4]]]) // [1, 2, 3, 4]
 */
export function flattenDeep<T>(arr: unknown[]): T[] {
	return arr.flat(Infinity) as T[];
}

/**
 * Возвращает разность двух массивов (элементы из первого, которых нет во втором).
 * Использует строгое сравнение элементов.
 * @param arr1 - Первый массив
 * @param arr2 - Второй массив
 * @returns Массив элементов из `arr1`, которых нет в `arr2`
 * @example
 * difference([1, 2, 3, 4], [2, 4]) // [1, 3]
 */
export function difference<T>(arr1: T[], arr2: T[]): T[] {
	const set2 = new Set(arr2);
	return arr1.filter((item) => !set2.has(item));
}

/**
 * Возвращает пересечение двух массивов (общие элементы).
 * Использует строгое сравнение элементов.
 * @param arr1 - Первый массив
 * @param arr2 - Второй массив
 * @returns Массив общих элементов
 * @example
 * intersection([1, 2, 3], [2, 3, 4]) // [2, 3]
 */
export function intersection<T>(arr1: T[], arr2: T[]): T[] {
	const set2 = new Set(arr2);
	return arr1.filter((item) => set2.has(item));
}

/**
 * Возвращает объединение нескольких массивов без дубликатов.
 * @param arrays - Массивы для объединения
 * @returns Массив уникальных элементов из всех переданных массивов
 * @example
 * union([1, 2], [2, 3], [3, 4]) // [1, 2, 3, 4]
 */
export function union<T>(...arrays: T[][]): T[] {
	return unique(arrays.flat());
}

/**
 * Возвращает первый элемент массива.
 * @param arr - Исходный массив
 * @returns Первый элемент или `undefined`, если массив пуст
 * @example
 * first([1, 2, 3]) // 1
 * first([]) // undefined
 */
export function first<T>(arr: T[]): T | undefined {
	return arr[0];
}

/**
 * Возвращает последний элемент массива.
 * @param arr - Исходный массив
 * @returns Последний элемент или `undefined`, если массив пуст
 * @example
 * last([1, 2, 3]) // 3
 * last([]) // undefined
 */
export function last<T>(arr: T[]): T | undefined {
	return arr[arr.length - 1];
}

/**
 * Возвращает случайный элемент из массива.
 * @param arr - Исходный массив
 * @returns Случайный элемент или `undefined`, если массив пуст
 * @example
 * sample([1, 2, 3, 4, 5]) // Может вернуть любой элемент из массива
 */
export function sample<T>(arr: T[]): T | undefined {
	if (arr.length === 0) return undefined;
	return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Возвращает N случайных элементов из массива без повторений.
 * Если N больше длины массива, возвращаются все элементы в случайном порядке.
 * @param arr - Исходный массив
 * @param n - Количество элементов для возврата
 * @returns Массив из N случайных элементов
 * @example
 * sampleN([1, 2, 3, 4, 5], 3) // Может вернуть [2, 5, 1] или любую другую комбинацию
 */
export function sampleN<T>(arr: T[], n: number): T[] {
	const shuffled = shuffle(arr);
	return shuffled.slice(0, n);
}

/**
 * Подсчитывает количество элементов в массиве, удовлетворяющих условию.
 * @param arr - Исходный массив
 * @param predicate - Функция-предикат, возвращающая `true` для подсчитываемых элементов
 * @returns Количество элементов, для которых предикат вернул `true`
 * @example
 * countBy([1, 2, 3, 4, 5], (n) => n % 2 === 0) // 2 (четные числа)
 */
export function countBy<T>(arr: T[], predicate: (item: T) => boolean): number {
	return arr.filter(predicate).length;
}

/**
 * Вычисляет сумму всех чисел в массиве.
 * @param arr - Массив чисел
 * @returns Сумма всех элементов. Если массив пуст, возвращает 0
 * @example
 * sum([1, 2, 3, 4]) // 10
 */
export function sum(arr: number[]): number {
	return arr.reduce((acc, val) => acc + val, 0);
}

/**
 * Вычисляет среднее арифметическое значение массива чисел.
 * @param arr - Массив чисел
 * @returns Среднее значение. Если массив пуст, возвращает 0
 * @example
 * average([1, 2, 3, 4, 5]) // 3
 */
export function average(arr: number[]): number {
	if (arr.length === 0) return 0;
	return sum(arr) / arr.length;
}

/**
 * Вычисляет медиану массива чисел.
 * Медиана - это средний элемент отсортированного массива.
 * @param arr - Массив чисел
 * @returns Медиана. Если массив пуст, возвращает 0
 * @example
 * median([1, 3, 5, 7, 9]) // 5
 * median([1, 2, 3, 4]) // 2.5 (среднее между 2 и 3)
 */
export function median(arr: number[]): number {
	if (arr.length === 0) return 0;
	const sorted = [...arr].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 !== 0 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/**
 * Находит минимальное значение в массиве чисел.
 * @param arr - Массив чисел
 * @returns Минимальное значение. Если массив пуст, возвращает `Infinity`
 * @example
 * min([5, 2, 8, 1]) // 1
 */
export function min(arr: number[]): number {
	if (arr.length === 0) return Infinity;
	return Math.min(...arr);
}

/**
 * Находит максимальное значение в массиве чисел.
 * @param arr - Массив чисел
 * @returns Максимальное значение. Если массив пуст, возвращает `-Infinity`
 * @example
 * max([5, 2, 8, 1]) // 8
 */
export function max(arr: number[]): number {
	if (arr.length === 0) return -Infinity;
	return Math.max(...arr);
}

/**
 * Находит элемент объекта с минимальным значением указанного ключа.
 * @param arr - Массив объектов
 * @param key - Ключ объекта для сравнения
 * @returns Объект с минимальным значением ключа или `undefined`, если массив пуст
 * @example
 * minBy([{age: 30}, {age: 20}], 'age') // {age: 20}
 */
export function minBy<T>(arr: T[], key: keyof T): T | undefined {
	if (arr.length === 0) return undefined;
	return arr.reduce((min, item) => (item[key] < min[key] ? item : min));
}

/**
 * Находит элемент объекта с максимальным значением указанного ключа.
 * @param arr - Массив объектов
 * @param key - Ключ объекта для сравнения
 * @returns Объект с максимальным значением ключа или `undefined`, если массив пуст
 * @example
 * maxBy([{age: 30}, {age: 20}], 'age') // {age: 30}
 */
export function maxBy<T>(arr: T[], key: keyof T): T | undefined {
	if (arr.length === 0) return undefined;
	return arr.reduce((max, item) => (item[key] > max[key] ? item : max));
}

/**
 * Преобразует массив объектов в объект, где ключи - значения указанного поля.
 * Если несколько элементов имеют одинаковое значение ключа, сохраняется последний.
 * @param arr - Массив объектов
 * @param key - Ключ объекта для использования в качестве ключа результирующего объекта
 * @returns Объект с ключами из указанного поля
 * @example
 * keyBy([{id: 1, name: 'a'}, {id: 2, name: 'b'}], 'id')
 * // { 1: {id: 1, name: 'a'}, 2: {id: 2, name: 'b'} }
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
 * Создает массив чисел в указанном диапазоне.
 * Начальное значение включено, конечное - исключено.
 * @param start - Начальное значение (включено)
 * @param end - Конечное значение (исключено)
 * @param step - Шаг инкремента, по умолчанию 1
 * @returns Массив чисел от `start` до `end` (не включая) с шагом `step`
 * @example
 * range(0, 5) // [0, 1, 2, 3, 4]
 * range(0, 10, 2) // [0, 2, 4, 6, 8]
 */
export function range(start: number, end: number, step = 1): number[] {
	const result: number[] = [];
	for (let i = start; i < end; i += step) {
		result.push(i);
	}
	return result;
}

/**
 * Проверяет, является ли массив пустым.
 * @param arr - Массив для проверки
 * @returns `true`, если массив пуст, иначе `false`
 * @example
 * isEmpty([]) // true
 * isEmpty([1, 2]) // false
 */
export function isEmpty<T>(arr: T[]): boolean {
	return arr.length === 0;
}

/**
 * Проверяет, является ли массив непустым (содержит хотя бы один элемент).
 * TypeScript type guard - сужает тип до непустого массива.
 * @param arr - Массив для проверки
 * @returns `true`, если массив содержит элементы, иначе `false`
 * @example
 * const items: number[] = [];
 * if (isNotEmpty(items)) {
 *   const first = items[0]; // TypeScript знает, что массив непустой
 * }
 */
export function isNotEmpty<T>(arr: T[]): arr is [T, ...T[]] {
	return arr.length > 0;
}

/**
 * Удаляет все falsy значения из массива (null, undefined, false, 0, '', NaN).
 * @param arr - Массив, который может содержать falsy значения
 * @returns Массив только с truthy значениями
 * @example
 * compact([0, 1, false, 2, '', 3, null, undefined]) // [1, 2, 3]
 */
export function compact<T>(arr: (T | null | undefined | false | 0 | '')[]): T[] {
	return arr.filter(Boolean) as T[];
}

/**
 * Объединяет два массива в массив пар [элемент1, элемент2].
 * Длина результирующего массива равна длине более короткого массива.
 * @param arr1 - Первый массив
 * @param arr2 - Второй массив
 * @returns Массив пар [элемент из arr1, элемент из arr2]
 * @example
 * zip([1, 2, 3], ['a', 'b', 'c']) // [[1, 'a'], [2, 'b'], [3, 'c']]
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
 * Разделяет массив на два массива на основе предиката.
 * Элементы, для которых предикат возвращает `true`, идут в первый массив,
 * остальные - во второй.
 * @param arr - Исходный массив
 * @param predicate - Функция-предикат для разделения элементов
 * @returns Кортеж из двух массивов: [элементы где true, элементы где false]
 * @example
 * partition([1, 2, 3, 4, 5], (n) => n % 2 === 0) // [[2, 4], [1, 3, 5]]
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
