/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * Middleware для защиты маршрутов, требующий аутентификацию
 */

import { Elysia } from 'elysia';
import { ApiError, HttpStatus } from '../utils/errors.js';
import type { AuthUser } from '../types.js';

/**
 * Middleware для защиты маршрутов, требующий обязательную аутентификацию.
 * Выбрасывает ошибку 401, если пользователь не аутентифицирован.
 * Используйте этот middleware как guard для групп защищенных маршрутов.
 *
 * **Требует, чтобы плагин authPlugin был подключен перед этим middleware.**
 * @example
 * app.use(authPlugin({ secret: 'secret' }));
 *
 * // Все маршруты в этой группе требуют аутентификации
 * app.group('/api/protected', (app) => app
 *   .use(jwtMiddleware)
 *   .get('/profile', ({ user }) => ({ user }))
 *   .get('/settings', ({ user }) => ({ settings: user }))
 * );
 */
export const jwtMiddleware = new Elysia({ name: 'jwt-middleware' }).derive((ctx) => {
	const user = (ctx as unknown as { user: AuthUser | null }).user;
	if (!user) {
		throw new ApiError(HttpStatus.UNAUTHORIZED, 'Authentication required');
	}
	return { user };
});
