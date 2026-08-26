/**
 * @fileoverview FMY Stack
 * @author Artem Prianishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2026 Artem Prianishnikov
 * @license Apache-2.0
 *
 * Базовые типы для всей платформы
 */

/**
 * Тип Result для безопасной обработки ошибок.
 * Вдохновлен типом Result из языка Rust. Позволяет явно обрабатывать успешные и ошибочные результаты.
 * @template T - Тип данных при успешном результате
 * @template E - Тип ошибки, по умолчанию Error
 * @example
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) return Err('Division by zero');
 *   return Ok(a / b);
 * }
 */
export type Result<T, E = Error> =
	| { success: true; data: T; error?: never }
	| { success: false; data?: never; error: E };

/**
 * Создает успешный результат для типа Result.
 * @param data - Данные успешного результата
 * @returns Result с success: true и переданными данными
 * @template T - Тип данных
 * @example
 * const result = Ok(42);
 * if (result.success) {
 *   console.log(result.data); // 42
 * }
 */
export function Ok<T>(data: T): Result<T, never> {
	return { success: true, data };
}

/**
 * Создает ошибочный результат для типа Result.
 * @param error - Ошибка или значение ошибки
 * @returns Result с success: false и переданной ошибкой
 * @template E - Тип ошибки
 * @example
 * const result = Err('Something went wrong');
 * if (!result.success) {
 *   console.log(result.error); // 'Something went wrong'
 * }
 */
export function Err<E>(error: E): Result<never, E> {
	return { success: false, error };
}

/**
 * Стандартный формат ответа API.
 * Содержит флаг успешности, опциональные данные, ошибку и метаданные.
 * @template T - Тип данных ответа
 */
export interface ApiResponse<T> {
	/** Флаг успешности выполнения запроса */
	success: boolean;
	/** Данные ответа (присутствуют при успешном запросе) */
	data?: T;
	/** Информация об ошибке (присутствует при ошибке) */
	error?: ApiError;
	/** Метаданные ответа (пагинация, количество записей и т.д.) */
	meta?: ApiMeta;
}

/**
 * Структура ошибки API.
 * Содержит код ошибки, сообщение и опциональные детали.
 */
export interface ApiError {
	/** Код ошибки для программной обработки */
	code: string;
	/** Человекочитаемое сообщение об ошибке */
	message: string;
	/** Дополнительные детали об ошибке (валидация, контекст и т.д.) */
	details?: Record<string, unknown>;
}

/**
 * Метаданные ответа API.
 * Используется для пагинации и передачи дополнительной информации о результате запроса.
 */
export interface ApiMeta {
	/** Номер текущей страницы */
	page?: number;
	/** Количество элементов на странице */
	limit?: number;
	/** Общее количество элементов */
	total?: number;
	/** Общее количество страниц */
	totalPages?: number;
}

/**
 * Пагинированный ответ API.
 * Содержит массив данных и обязательные метаданные пагинации.
 * @template T - Тип элементов в массиве данных
 */
export interface PaginatedResponse<T> {
	/** Массив данных текущей страницы */
	data: T[];
	/** Метаданные пагинации (все поля обязательны) */
	meta: Required<Pick<ApiMeta, 'page' | 'limit' | 'total' | 'totalPages'>>;
}

/**
 * Доступные роли пользователей в системе.
 * Используется для авторизации и разграничения доступа.
 */
export const UserRole = {
	ADMIN: 'admin',
	MANAGER: 'manager',
	USER: 'user',
	GUEST: 'guest'
} as const;

/**
 * Тип роли пользователя - одно из значений UserRole.
 */
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/**
 * Доступные статусы сущностей в системе.
 * Используется для управления жизненным циклом записей.
 */
export const EntityStatus = {
	ACTIVE: 'active',
	INACTIVE: 'inactive',
	DELETED: 'deleted',
	PENDING: 'pending',
	ARCHIVED: 'archived'
} as const;

/**
 * Тип статуса сущности - одно из значений EntityStatus.
 */
export type EntityStatus = (typeof EntityStatus)[keyof typeof EntityStatus];

/**
 * Утилитарный тип: делает тип допускающим значение null.
 * @template T - Исходный тип
 * @example
 * type UserName = Nullable<string>; // string | null
 */
export type Nullable<T> = T | null;

/**
 * Утилитарный тип: делает тип допускающим значение undefined.
 * @template T - Исходный тип
 * @example
 * type OptionalName = Optional<string>; // string | undefined
 */
export type Optional<T> = T | undefined;

/**
 * Утилитарный тип: делает тип допускающим значение null или undefined.
 * @template T - Исходный тип
 * @example
 * type MaybeName = Maybe<string>; // string | null | undefined
 */
export type Maybe<T> = T | null | undefined;

/**
 * Утилитарный тип: делает все свойства объекта опциональными рекурсивно.
 * Применяется к вложенным объектам тоже.
 * @template T - Исходный тип
 * @example
 * type User = { name: string; profile: { age: number } };
 * type PartialUser = DeepPartial<User>; // { name?: string; profile?: { age?: number } }
 */
export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Утилитарный тип: делает все свойства объекта только для чтения рекурсивно.
 * Применяется к вложенным объектам тоже.
 * @template T - Исходный тип
 * @example
 * type User = { name: string; profile: { age: number } };
 * type ReadonlyUser = DeepReadonly<User>; // { readonly name: string; readonly profile: { readonly age: number } }
 */
export type DeepReadonly<T> = {
	readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Утилитарный тип: извлекает ключи объекта, значения которых соответствуют указанному типу.
 * @template T - Тип объекта
 * @template V - Тип значения для фильтрации ключей
 * @example
 * type User = { id: number; name: string; age: number };
 * type NumberKeys = KeysOfType<User, number>; // 'id' | 'age'
 */
export type KeysOfType<T, V> = {
	[K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Утилитарный тип: исключает несколько ключей из типа объекта.
 * @template T - Исходный тип объекта
 * @template K - Ключи для исключения
 * @example
 * type User = { id: number; name: string; email: string };
 * type WithoutIdAndEmail = OmitMultiple<User, 'id' | 'email'>; // { name: string }
 */
export type OmitMultiple<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Тип функции без аргументов, которая ничего не возвращает.
 */
export type VoidFunction = () => void;

/**
 * Тип асинхронной функции без аргументов.
 * @template T - Тип значения, возвращаемого промисом
 */
export type AsyncFunction<T = void> = () => Promise<T>;

/**
 * Тип callback функции с паттерном (error, result).
 * Используется для функций в стиле Node.js callback.
 * @template T - Тип результата
 * @template E - Тип ошибки
 * @example
 * function readFile(path: string, callback: Callback<string>): void {
 *   // callback(null, content) при успехе
 *   // callback(error) при ошибке
 * }
 */
export type Callback<T = void, E = Error> = (error: E | null, result?: T) => void;
