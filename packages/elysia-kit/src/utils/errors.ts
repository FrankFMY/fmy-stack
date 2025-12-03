/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * Обработка ошибок API и HTTP статус-коды
 */

/**
 * Стандартные HTTP статус-коды для API.
 * Используются для единообразной обработки ошибок и успешных ответов.
 */
export const HttpStatus = {
	/** Успешный запрос */
	OK: 200,
	/** Ресурс успешно создан */
	CREATED: 201,
	/** Успешный запрос без содержимого */
	NO_CONTENT: 204,
	/** Неверный запрос (валидация не прошла) */
	BAD_REQUEST: 400,
	/** Требуется аутентификация */
	UNAUTHORIZED: 401,
	/** Доступ запрещен */
	FORBIDDEN: 403,
	/** Ресурс не найден */
	NOT_FOUND: 404,
	/** Конфликт (например, дубликат) */
	CONFLICT: 409,
	/** Необрабатываемая сущность (семантическая ошибка) */
	UNPROCESSABLE_ENTITY: 422,
	/** Слишком много запросов (rate limit) */
	TOO_MANY_REQUESTS: 429,
	/** Внутренняя ошибка сервера */
	INTERNAL_SERVER_ERROR: 500,
	/** Сервис недоступен */
	SERVICE_UNAVAILABLE: 503
} as const;

/**
 * Тип HTTP статус-кода из HttpStatus enum.
 */
export type HttpStatusCode = (typeof HttpStatus)[keyof typeof HttpStatus];

/**
 * Класс ошибки API с HTTP статус-кодом.
 * Используется для структурированной обработки ошибок в ElysiaJS приложениях.
 * @example
 * throw new ApiError(HttpStatus.NOT_FOUND, 'User not found');
 * throw ApiError.badRequest('Invalid email format', { field: 'email' });
 */
export class ApiError extends Error {
	/**
	 * Создает экземпляр ошибки API.
	 * @param status - HTTP статус-код ошибки
	 * @param message - Сообщение об ошибке
	 * @param details - Дополнительные детали об ошибке (опционально)
	 */
	constructor(
		public readonly status: HttpStatusCode,
		message: string,
		public readonly details?: unknown
	) {
		super(message);
		this.name = 'ApiError';
		Error.captureStackTrace?.(this, ApiError);
	}

	/**
	 * Создает ошибку "Неверный запрос" (400).
	 * @param message - Сообщение об ошибке
	 * @param details - Дополнительные детали (опционально)
	 * @returns Экземпляр ApiError со статусом 400
	 * @example
	 * throw ApiError.badRequest('Email уже используется', { email: 'user@example.com' });
	 */
	static badRequest(message: string, details?: unknown): ApiError {
		return new ApiError(HttpStatus.BAD_REQUEST, message, details);
	}

	/**
	 * Создает ошибку "Неавторизован" (401).
	 * @param message - Сообщение об ошибке (по умолчанию 'Unauthorized')
	 * @returns Экземпляр ApiError со статусом 401
	 * @example
	 * throw ApiError.unauthorized('Invalid or expired token');
	 */
	static unauthorized(message = 'Unauthorized'): ApiError {
		return new ApiError(HttpStatus.UNAUTHORIZED, message);
	}

	/**
	 * Создает ошибку "Доступ запрещен" (403).
	 * @param message - Сообщение об ошибке (по умолчанию 'Forbidden')
	 * @returns Экземпляр ApiError со статусом 403
	 * @example
	 * throw ApiError.forbidden('Insufficient permissions');
	 */
	static forbidden(message = 'Forbidden'): ApiError {
		return new ApiError(HttpStatus.FORBIDDEN, message);
	}

	/**
	 * Создает ошибку "Не найдено" (404).
	 * @param message - Сообщение об ошибке (по умолчанию 'Not found')
	 * @returns Экземпляр ApiError со статусом 404
	 * @example
	 * throw ApiError.notFound('User with id 123 not found');
	 */
	static notFound(message = 'Not found'): ApiError {
		return new ApiError(HttpStatus.NOT_FOUND, message);
	}

	/**
	 * Создает ошибку "Конфликт" (409).
	 * Используется при попытке создать ресурс, который уже существует.
	 * @param message - Сообщение об ошибке
	 * @returns Экземпляр ApiError со статусом 409
	 * @example
	 * throw ApiError.conflict('User with this email already exists');
	 */
	static conflict(message: string): ApiError {
		return new ApiError(HttpStatus.CONFLICT, message);
	}

	/**
	 * Создает ошибку "Внутренняя ошибка сервера" (500).
	 * Используется для неожиданных ошибок сервера.
	 * @param message - Сообщение об ошибке (по умолчанию 'Internal server error')
	 * @returns Экземпляр ApiError со статусом 500
	 * @example
	 * throw ApiError.internal('Database connection failed');
	 */
	static internal(message = 'Internal server error'): ApiError {
		return new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, message);
	}
}
