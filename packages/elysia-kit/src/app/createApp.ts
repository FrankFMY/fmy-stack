/**
 * @fileoverview FrankFMY Platform — Initiative Development
 * @author Artyom Pryanishnikov | @license PolyForm-Shield-1.0.0
 */

import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { errorHandler } from '../middleware/errorHandler.js';
import { requestLogger } from '../middleware/requestLogger.js';

export interface AppConfig {
	name?: string;
	prefix?: string;
	cors?: {
		origin?: string | string[] | boolean;
		methods?: string[];
		credentials?: boolean;
	};
	swagger?: {
		path?: string;
		documentation?: {
			info?: {
				title?: string;
				version?: string;
				description?: string;
			};
		};
	};
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
						description:
							finalConfig.swagger.documentation?.info?.description ?? 'API documentation'
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
