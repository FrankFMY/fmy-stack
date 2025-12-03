/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * Базовые типы для всей платформы
 */

/**
 * Result type для безопасной обработки ошибок
 * Вдохновлен Rust Result<T, E>
 */
export type Result<T, E = Error> =
	| { success: true; data: T; error?: never }
	| { success: false; data?: never; error: E };

/**
 * Создать успешный Result
 */
export function Ok<T>(data: T): Result<T, never> {
	return { success: true, data };
}

/**
 * Создать Result с ошибкой
 */
export function Err<E>(error: E): Result<never, E> {
	return { success: false, error };
}

/**
 * Стандартный ответ API
 */
export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: ApiError;
	meta?: ApiMeta;
}

/**
 * Ошибка API
 */
export interface ApiError {
	code: string;
	message: string;
	details?: Record<string, unknown>;
}

/**
 * Метаданные ответа API
 */
export interface ApiMeta {
	page?: number;
	limit?: number;
	total?: number;
	totalPages?: number;
}

/**
 * Пагинированный ответ
 */
export interface PaginatedResponse<T> {
	data: T[];
	meta: Required<Pick<ApiMeta, 'page' | 'limit' | 'total' | 'totalPages'>>;
}

/**
 * Роли пользователей
 */
export const UserRole = {
	ADMIN: 'admin',
	MANAGER: 'manager',
	USER: 'user',
	GUEST: 'guest'
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/**
 * Статусы сущностей
 */
export const EntityStatus = {
	ACTIVE: 'active',
	INACTIVE: 'inactive',
	DELETED: 'deleted',
	PENDING: 'pending',
	ARCHIVED: 'archived'
} as const;

export type EntityStatus = (typeof EntityStatus)[keyof typeof EntityStatus];

/**
 * Nullable тип
 */
export type Nullable<T> = T | null;

/**
 * Optional тип
 */
export type Optional<T> = T | undefined;

/**
 * Maybe тип (nullable + optional)
 */
export type Maybe<T> = T | null | undefined;

/**
 * Partial с глубоким проходом
 */
export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Readonly с глубоким проходом
 */
export type DeepReadonly<T> = {
	readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Извлечь ключи объекта определенного типа
 */
export type KeysOfType<T, V> = {
	[K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Omit с несколькими ключами
 */
export type OmitMultiple<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Функция без аргументов
 */
export type VoidFunction = () => void;

/**
 * Асинхронная функция
 */
export type AsyncFunction<T = void> = () => Promise<T>;

/**
 * Callback функция
 */
export type Callback<T = void, E = Error> = (error: E | null, result?: T) => void;

