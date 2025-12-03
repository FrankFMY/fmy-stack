/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * Утилиты для работы с CSS классами
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Объединяет CSS классы с использованием tailwind-merge для корректной обработки конфликтов.
 * Автоматически объединяет конфликтующие Tailwind классы, оставляя последний примененный.
 * @param inputs - Переменное количество аргументов, которые могут быть строками, объектами, массивами или условными классами.
 * @returns Объединенная строка CSS классов с правильно разрешенными конфликтами Tailwind.
 * @example
 * cn('px-2 py-1', 'px-4') // 'py-1 px-4' (px-2 перезаписывается px-4)
 * cn('text-red-500', { 'text-blue-500': isBlue }) // условные классы
 * cn(['px-2', 'py-1'], 'bg-white') // массив классов
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
