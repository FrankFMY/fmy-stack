/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * Утилиты для работы с функциями
 */

/**
 * Debounce функция - откладывает выполнение до прекращения вызовов
 * @param fn Функция для debounce
 * @param delay Задержка в миллисекундах
 * @returns Debounced функция
 * @example
 * const debouncedSearch = debounce((query) => search(query), 300);
 * input.addEventListener('input', (e) => debouncedSearch(e.target.value));
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
	fn: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout>;
	return (...args: Parameters<T>) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), delay);
	};
}

/**
 * Throttle функция - ограничивает частоту вызовов
 * @param fn Функция для throttle
 * @param limit Минимальный интервал между вызовами в миллисекундах
 * @returns Throttled функция
 * @example
 * const throttledScroll = throttle(() => updatePosition(), 100);
 * window.addEventListener('scroll', throttledScroll);
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
	fn: T,
	limit: number
): (...args: Parameters<T>) => void {
	let inThrottle = false;
	return (...args: Parameters<T>) => {
		if (!inThrottle) {
			fn(...args);
			inThrottle = true;
			setTimeout(() => {
				inThrottle = false;
			}, limit);
		}
	};
}

/**
 * Debounce с возможностью немедленного первого вызова
 * @param fn Функция для debounce
 * @param delay Задержка в миллисекундах
 * @param immediate Если true, первый вызов выполняется немедленно
 * @returns Debounced функция
 */
export function debounceImmediate<T extends (...args: unknown[]) => unknown>(
	fn: T,
	delay: number,
	immediate = false
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	return (...args: Parameters<T>) => {
		const callNow = immediate && !timeoutId;
		if (timeoutId) clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			timeoutId = null;
			if (!immediate) fn(...args);
		}, delay);
		if (callNow) fn(...args);
	};
}

/**
 * Throttle с trailing вызовом
 * @param fn Функция для throttle
 * @param limit Минимальный интервал между вызовами в миллисекундах
 * @returns Throttled функция с trailing
 */
export function throttleWithTrailing<T extends (...args: unknown[]) => unknown>(
	fn: T,
	limit: number
): (...args: Parameters<T>) => void {
	let lastArgs: Parameters<T> | null = null;
	let inThrottle = false;

	return (...args: Parameters<T>) => {
		if (!inThrottle) {
			fn(...args);
			inThrottle = true;
			setTimeout(() => {
				inThrottle = false;
				if (lastArgs) {
					fn(...lastArgs);
					lastArgs = null;
				}
			}, limit);
		} else {
			lastArgs = args;
		}
	};
}

/**
 * Мемоизация функции
 * @param fn Функция для мемоизации
 * @returns Мемоизированная функция
 * @example
 * const memoizedFib = memoize((n) => n <= 1 ? n : memoizedFib(n - 1) + memoizedFib(n - 2));
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
	fn: T
): T {
	const cache = new Map<string, ReturnType<T>>();
	return ((...args: Parameters<T>) => {
		const key = JSON.stringify(args);
		if (cache.has(key)) {
			return cache.get(key)!;
		}
		const result = fn(...args) as ReturnType<T>;
		cache.set(key, result);
		return result;
	}) as T;
}

/**
 * Once - функция выполняется только один раз
 * @param fn Функция
 * @returns Функция, которая выполнится только один раз
 */
export function once<T extends (...args: unknown[]) => unknown>(
	fn: T
): (...args: Parameters<T>) => ReturnType<T> | undefined {
	let called = false;
	let result: ReturnType<T>;
	return (...args: Parameters<T>) => {
		if (!called) {
			called = true;
			result = fn(...args) as ReturnType<T>;
		}
		return result;
	};
}

/**
 * Noop - пустая функция
 */
export const noop = (): void => {};

/**
 * Identity - возвращает аргумент как есть
 */
export const identity = <T>(value: T): T => value;

/**
 * Compose - композиция функций (справа налево)
 * @example
 * const addOne = (x) => x + 1;
 * const double = (x) => x * 2;
 * const addOneThenDouble = compose(double, addOne);
 * addOneThenDouble(5); // 12
 */
export function compose<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
	return (arg: T) => fns.reduceRight((acc, fn) => fn(acc), arg);
}

/**
 * Pipe - композиция функций (слева направо)
 * @example
 * const addOne = (x) => x + 1;
 * const double = (x) => x * 2;
 * const addOneThenDouble = pipe(addOne, double);
 * addOneThenDouble(5); // 12
 */
export function pipe<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
	return (arg: T) => fns.reduce((acc, fn) => fn(acc), arg);
}

/**
 * Sleep - промис с задержкой
 * @param ms Время задержки в миллисекундах
 */
export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry - повторить выполнение функции при ошибке
 * @param fn Асинхронная функция
 * @param maxRetries Максимальное количество попыток
 * @param delay Задержка между попытками в миллисекундах
 */
export async function retry<T>(
	fn: () => Promise<T>,
	maxRetries: number = 3,
	delay: number = 1000
): Promise<T> {
	let lastError: Error | null = null;

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error as Error;
			if (attempt < maxRetries - 1) {
				await sleep(delay * (attempt + 1));
			}
		}
	}

	throw lastError;
}

