/**
 * @fileoverview FMY Stack
 * @author Artem Prianishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2026 Artem Prianishnikov
 * @license Apache-2.0
 *
 * Общие типы для ElysiaJS приложений
 */

import type { Elysia } from 'elysia';

/**
 * Тип приложения ElysiaJS.
 * Алиас для Elysia для удобства использования.
 */
export type ElysiaApp = Elysia;

/**
 * Контекст запроса ElysiaJS.
 * Содержит всю информацию о текущем HTTP запросе.
 */
export interface Context {
	/** Объект Request */
	request: Request;
	/** Путь запроса */
	path: string;
	/** Параметры пути (route params) */
	params: Record<string, string>;
	/** Query параметры из URL */
	query: Record<string, string | undefined>;
	/** HTTP заголовки запроса */
	headers: Record<string, string | undefined>;
	/** Тело запроса (parsed body) */
	body: unknown;
	/** Объект для установки ответа */
	set: {
		/** HTTP заголовки ответа */
		headers: Record<string, string>;
		/** HTTP статус-код ответа */
		status?: number;
		/** URL для редиректа */
		redirect?: string;
	};
}

/**
 * Полезная нагрузка JWT токена.
 * Стандартные поля JWT плюс дополнительные поля для аутентификации.
 */
export interface JwtPayload {
	/** Subject (обычно user ID) */
	sub: string;
	/** Expiration time (timestamp) */
	exp: number;
	/** Issued at (timestamp) */
	iat: number;
	/** Роль пользователя (опционально) */
	role?: string;
	/** Email пользователя (опционально) */
	email?: string;
	/** Дополнительные произвольные поля */
	[key: string]: unknown;
}

/**
 * Аутентифицированный пользователь.
 * Структура пользователя, извлекаемая из JWT токена.
 */
export interface AuthUser {
	/** Уникальный идентификатор пользователя */
	id: string;
	/** Email пользователя (опционально) */
	email?: string | undefined;
	/** Роль пользователя (опционально) */
	role?: string | undefined;
	/** Дополнительные произвольные поля */
	[key: string]: unknown;
}
