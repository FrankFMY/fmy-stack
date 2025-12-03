/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * Утилиты для формирования стандартизированных ответов API
 */

import type { HttpStatusCode } from './errors.js';

/**
 * Стандартный ответ API.
 * Используется для единообразного формата всех ответов.
 * @template T Тип данных в ответе
 */
export interface ApiResponse<T = unknown> {
	/** Флаг успешности операции */
	success: boolean;
	/** Данные ответа (присутствует при успехе) */
	data?: T;
	/** Сообщение об ошибке (присутствует при ошибке) */
	error?: string;
	/** Дополнительные детали об ошибке */
	details?: unknown;
	/** Метаданные (для пагинации и т.д.) */
	meta?: {
		/** Номер страницы */
		page?: number;
		/** Количество элементов на странице */
		limit?: number;
		/** Общее количество элементов */
		total?: number;
		/** Общее количество страниц */
		totalPages?: number;
	};
}

/**
 * Ответ API с пагинацией.
 * Расширяет ApiResponse, требуя обязательные метаданные пагинации.
 * @template T Тип элементов в массиве данных
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
	/** Метаданные пагинации (обязательные) */
	meta: {
		/** Номер страницы */
		page: number;
		/** Количество элементов на странице */
		limit: number;
		/** Общее количество элементов */
		total: number;
		/** Общее количество страниц */
		totalPages: number;
	};
}

/**
 * Утилиты для формирования стандартизированных ответов API.
 * Предоставляет методы для успешных ответов, ошибок и пагинации.
 */
export const respond = {
	/**
	 * Формирует успешный ответ API.
	 * @template T Тип данных в ответе
	 * @param data - Данные для возврата
	 * @param meta - Опциональные метаданные (для пагинации и т.д.)
	 * @returns Успешный ответ API
	 * @example
	 * return respond.success({ id: 1, name: 'John' });
	 * return respond.success(users, { page: 1, limit: 10, total: 100 });
	 */
	success<T>(data: T, meta?: ApiResponse['meta']): ApiResponse<T> {
		const response: ApiResponse<T> = {
			success: true,
			data
		};
		if (meta) {
			response.meta = meta;
		}
		return response;
	},

	/**
	 * Формирует ответ об ошибке API.
	 * @param message - Сообщение об ошибке
	 * @param _status - HTTP статус-код (для информации, не используется в ответе)
	 * @param details - Дополнительные детали об ошибке
	 * @returns Ответ об ошибке
	 * @example
	 * return respond.error('User not found', HttpStatus.NOT_FOUND);
	 * return respond.error('Validation failed', HttpStatus.BAD_REQUEST, { fields: ['email'] });
	 */
	error(message: string, _status?: HttpStatusCode, details?: unknown): ApiResponse {
		const response: ApiResponse = {
			success: false,
			error: message
		};
		if (details !== undefined) {
			response.details = details;
		}
		return response;
	},

	/**
	 * Формирует ответ API с пагинацией.
	 * @template T Тип элементов в массиве данных
	 * @param data - Массив данных для текущей страницы
	 * @param page - Номер страницы
	 * @param limit - Количество элементов на странице
	 * @param total - Общее количество элементов
	 * @returns Ответ с пагинацией
	 * @example
	 * return respond.paginated(users, 1, 20, 100);
	 * // { success: true, data: [...], meta: { page: 1, limit: 20, total: 100, totalPages: 5 } }
	 */
	paginated<T>(data: T[], page: number, limit: number, total: number): PaginatedResponse<T> {
		return {
			success: true,
			data,
			meta: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		};
	},

	/**
	 * Формирует ответ для успешно созданного ресурса (201 Created).
	 * @template T Тип созданного ресурса
	 * @param data - Данные созданного ресурса
	 * @returns Успешный ответ с данными
	 * @example
	 * return respond.created({ id: newId, name: 'New User' });
	 */
	created<T>(data: T): ApiResponse<T> {
		return {
			success: true,
			data
		};
	},

	/**
	 * Формирует ответ без содержимого (204 No Content).
	 * Используется для успешных операций, которые не возвращают данные.
	 * @returns Успешный ответ без данных
	 * @example
	 * return respond.noContent(); // { success: true }
	 */
	noContent(): ApiResponse {
		return {
			success: true
		};
	}
};
