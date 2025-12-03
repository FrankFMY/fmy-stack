/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * Middleware для логирования HTTP запросов и ответов
 */

import { Elysia } from 'elysia';

/**
 * Middleware для логирования всех входящих HTTP запросов и ответов.
 * Выводит в консоль:
 * - Входящий запрос: метод и путь
 * - Исходящий ответ: метод, путь, статус-код (с цветом) и время выполнения
 *
 * Использует цветную подсветку статус-кодов (зеленый для 2xx, желтый для 4xx, красный для 5xx).
 * @example
 * app.use(requestLogger);
 * // Теперь все запросы будут логироваться в консоль
 */
export const requestLogger = new Elysia({ name: 'request-logger' })
	.derive(() => ({
		startTime: Date.now()
	}))
	.onRequest(({ request }) => {
		const method = request.method;
		const url = new URL(request.url);
		console.log(`→ ${method} ${url.pathname}`);
	})
	.onAfterResponse(({ request, set, startTime }) => {
		const duration = Date.now() - startTime;
		const method = request.method;
		const url = new URL(request.url);
		const status = Number(set.status ?? 200);

		const statusColor =
			status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
		const reset = '\x1b[0m';

		console.log(
			`← ${method} ${url.pathname} ${statusColor}${status}${reset} ${duration}ms`
		);
	});
