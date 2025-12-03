/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * @frankfmy/elysia-kit - ElysiaJS Backend Framework Utilities
 */

// App Factory
export { createApp, type AppConfig } from './app/createApp.js';

// Auth
export { authPlugin, type AuthConfig } from './auth/authPlugin.js';
export { jwtMiddleware } from './auth/jwtMiddleware.js';

// Middleware
export { errorHandler } from './middleware/errorHandler.js';
export { requestLogger } from './middleware/requestLogger.js';
export { rateLimiter, type RateLimitConfig } from './middleware/rateLimiter.js';

// Utils
export { ApiError, HttpStatus } from './utils/errors.js';
export { respond, type ApiResponse } from './utils/response.js';

// Types
export type { Context, ElysiaApp } from './types.js';

