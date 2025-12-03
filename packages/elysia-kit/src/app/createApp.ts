/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * Фабрика для создания настроенного приложения ElysiaJS
 */

import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { Elysia } from 'elysia';
import { errorHandler } from '../middleware/errorHandler.js';
import { requestLogger } from '../middleware/requestLogger.js';

/**
 * Конфигурация для создания ElysiaJS приложения.
 */
export interface AppConfig {
	/** Имя приложения (по умолчанию 'FrankFMY API') */
	name?: string;
	/** Префикс для всех маршрутов API (по умолчанию '/api') */
	prefix?: string;
	/** Настройки CORS */
	cors?: {
		/** Разрешенные источники (origin) */
		origin?: string | string[] | boolean;
		/** Разрешенные HTTP методы */
		methods?: string[];
		/** Разрешать отправку credentials (cookies, authorization headers) */
		credentials?: boolean;
	};
	/** Настройки Swagger документации */
	swagger?: {
		/** Путь к Swagger UI (по умолчанию '/docs') */
		path?: string;
		/** Конфигурация документации */
		documentation?: {
			/** Информация о API */
			info?: {
				/** Заголовок API */
				title?: string;
				/** Версия API */
				version?: string;
				/** Описание API */
				description?: string;
			};
		};
	};
	/** Включить логирование запросов (по умолчанию true) */
	logging?: boolean;
}

const defaultConfig: AppConfig = {
	name: 'FrankFMY API',
	prefix: '/api',
	cors: {
		origin: true,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		credentials: true
	},
	swagger: {
		path: '/docs',
		documentation: {
			info: {
				title: 'FrankFMY API',
				version: '1.0.0',
				description: 'API documentation'
			}
		}
	},
	logging: true
};

/**
 * Создает настроенное приложение ElysiaJS с предустановленными middleware.
 * Автоматически настраивает:
 * - Глобальный обработчик ошибок
 * - CORS (если указан)
 * - Swagger документацию (если указан)
 * - Логирование запросов (если включено)
 * @param config - Конфигурация приложения (опционально)
 * @returns Настроенный экземпляр ElysiaJS приложения
 * @example
 * const app = createApp({
 *   name: 'My API',
 *   prefix: '/api/v1',
 *   cors: { origin: ['https://example.com'] },
 *   swagger: { path: '/api-docs' },
 *   logging: true
 * });
 *
 * app.get('/users', () => ({ users: [] }));
 * app.listen(3000);
 */
export function createApp(config: AppConfig = {}) {
	const finalConfig = { ...defaultConfig, ...config };

	const app = new Elysia({
		name: finalConfig.name ?? 'FrankFMY API',
		prefix: finalConfig.prefix ?? '/api'
	});

	// Global error handler
	app.use(errorHandler);

	// CORS
	if (finalConfig.cors) {
		app.use(cors(finalConfig.cors));
	}

	// Swagger documentation
	if (finalConfig.swagger) {
		app.use(
			swagger({
				path: finalConfig.swagger.path ?? '/docs',
				documentation: {
					info: {
						title: finalConfig.swagger.documentation?.info?.title ?? 'FrankFMY API',
						version: finalConfig.swagger.documentation?.info?.version ?? '1.0.0',
						description: finalConfig.swagger.documentation?.info?.description ?? 'API documentation'
					}
				}
			})
		);
	}

	// Request logging
	if (finalConfig.logging) {
		app.use(requestLogger);
	}

	return app;
}
