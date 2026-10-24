/**
 * @fileoverview FMY Stack
 * @author Artem Prianishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2026 Artem Prianishnikov
 * @license Apache-2.0
 *
 * Глобальный обработчик ошибок для ElysiaJS приложений
 */

import { Elysia } from 'elysia';
import { ApiError, HttpStatus } from '../utils/errors.js';
import { respond } from '../utils/response.js';

/**
 * Глобальный обработчик ошибок для ElysiaJS.
 * Автоматически обрабатывает:
 * - ApiError (пользовательские ошибки API)
 * - Ошибки валидации Elysia
 * - Неизвестные ошибки (не раскрывает детали в production)
 *
 * Возвращает стандартизированный формат ответа с ошибкой.
 * @example
 * app.use(errorHandler);
 * // Теперь все ошибки будут обработаны автоматически
 */
export const errorHandler = new Elysia({ name: 'error-handler' })
	.onError(({ code, error, set }) => {
		// Handle our custom ApiError
		if (error instanceof ApiError) {
			set.status = error.status;
			return respond.error(error.message, error.status, error.details);
		}

		// Keep framework routing and parsing failures as client errors.
		if (code === 'NOT_FOUND') {
			set.status = HttpStatus.NOT_FOUND;
			return respond.error('Not found', HttpStatus.NOT_FOUND);
		}
		if (code === 'PARSE') {
			set.status = HttpStatus.BAD_REQUEST;
			return respond.error('Invalid request body', HttpStatus.BAD_REQUEST);
		}

		// Handle Elysia validation errors
		if (error && typeof error === 'object' && 'code' in error && error.code === 'VALIDATION') {
			set.status = HttpStatus.BAD_REQUEST;
			const message = 'message' in error ? String(error.message) : 'Validation error';
			return respond.error('Validation error', HttpStatus.BAD_REQUEST, message);
		}

		// Handle unknown errors
		console.error('Unhandled error:', error);
		set.status = HttpStatus.INTERNAL_SERVER_ERROR;

		// Don't expose internal error details in production
		const message =
			process.env.NODE_ENV === 'production'
				? 'Internal server error'
				: error instanceof Error
					? error.message
					: 'Unknown error';

		return respond.error(message, HttpStatus.INTERNAL_SERVER_ERROR);
	})
	.as('scoped');
