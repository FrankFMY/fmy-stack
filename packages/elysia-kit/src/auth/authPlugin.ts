/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * Плагин аутентификации для ElysiaJS с поддержкой JWT
 */

import { jwt } from '@elysiajs/jwt';
import { Elysia } from 'elysia';
import { ApiError, HttpStatus } from '../utils/errors.js';
import type { AuthUser, JwtPayload } from '../types.js';

/**
 * Конфигурация плагина аутентификации.
 */
export interface AuthConfig {
	/** Секретный ключ для подписи JWT токенов */
	secret: string;
	/** Время жизни токена (по умолчанию '7d') */
	expiresIn?: string;
	/** Имя cookie для хранения токена (по умолчанию 'auth_token') */
	cookieName?: string;
	/** Имя HTTP заголовка для токена (по умолчанию 'Authorization') */
	headerName?: string;
}

const defaultConfig = {
	expiresIn: '7d',
	cookieName: 'auth_token',
	headerName: 'Authorization'
} as const;

/**
 * Создает плагин аутентификации для ElysiaJS.
 * Предоставляет:
 * - JWT обработку токенов
 * - Автоматическое извлечение пользователя из токена (из заголовка или cookie)
 * - Макросы для защиты маршрутов: `.auth(true)` и `.roles(['admin'])`
 *
 * Добавляет в контекст: `user` (AuthUser | null) и `token` (string | null).
 * @param config - Конфигурация аутентификации
 * @returns ElysiaJS plugin с поддержкой аутентификации
 * @example
 * app.use(authPlugin({ secret: process.env.JWT_SECRET! }));
 *
 * app.get('/profile', ({ user }) => {
 *   // user доступен из контекста
 *   return { user };
 * });
 *
 * app.get('/admin', ({ user }) => {
 *   // Защищенный маршрут
 * }).auth(true);
 *
 * app.get('/admin/users', () => {
 *   // Защищенный маршрут только для роли 'admin'
 * }).roles(['admin']);
 */
export function authPlugin(config: AuthConfig) {
	const finalConfig = { ...defaultConfig, ...config };

	return new Elysia({ name: 'auth' })
		.use(
			jwt({
				name: 'jwt',
				secret: finalConfig.secret,
				exp: finalConfig.expiresIn ?? '7d'
			})
		)
		.derive(async ({ jwt, headers, cookie }) => {
			// Get token from header or cookie
			let token: string | undefined;

			const headerKey = finalConfig.headerName!.toLowerCase();
			const authHeader = headers[headerKey];
			if (authHeader?.startsWith('Bearer ')) {
				token = authHeader.slice(7);
			} else {
				const cookieValue = cookie[finalConfig.cookieName!];
				if (cookieValue?.value) {
					token = String(cookieValue.value);
				}
			}

			if (!token) {
				return { user: null as AuthUser | null, token: null as string | null };
			}

			try {
				const payload = (await jwt.verify(token)) as JwtPayload | false;

				if (!payload) {
					return { user: null, token: null };
				}

				const user: AuthUser = {
					id: payload.sub,
					email: payload.email,
					role: payload.role
				};

				return { user, token };
			} catch {
				return { user: null, token: null };
			}
		})
		.macro(({ onBeforeHandle }) => ({
			auth(enabled: boolean) {
				if (!enabled) return;
				onBeforeHandle(({ user }: { user: AuthUser | null }) => {
					if (!user) {
						throw new ApiError(HttpStatus.UNAUTHORIZED, 'Authentication required');
					}
				});
			},
			roles(allowedRoles: string[]) {
				onBeforeHandle(({ user }: { user: AuthUser | null }) => {
					if (!user) {
						throw new ApiError(HttpStatus.UNAUTHORIZED, 'Authentication required');
					}
					if (!user.role || !allowedRoles.includes(user.role)) {
						throw new ApiError(HttpStatus.FORBIDDEN, 'Insufficient permissions');
					}
				});
			}
		}));
}
