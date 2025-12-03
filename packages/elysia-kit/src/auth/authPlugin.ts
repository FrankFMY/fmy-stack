/**
 * @fileoverview FrankFMY Platform — Initiative Development
 * @author Artyom Pryanishnikov | @license PolyForm-Shield-1.0.0
 */

import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import type { JwtPayload, AuthUser } from '../types.js';
import { ApiError, HttpStatus } from '../utils/errors.js';

export interface AuthConfig {
	secret: string;
	expiresIn?: string;
	cookieName?: string;
	headerName?: string;
}

const defaultConfig = {
	expiresIn: '7d',
	cookieName: 'auth_token',
	headerName: 'Authorization'
} as const;

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
