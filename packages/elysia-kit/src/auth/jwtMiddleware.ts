/**
 * @fileoverview FrankFMY Platform — Initiative Development
 * @author Artyom Pryanishnikov | @license PolyForm-Shield-1.0.0
 */

import { Elysia } from 'elysia';
import { ApiError, HttpStatus } from '../utils/errors.js';
import type { AuthUser } from '../types.js';

/**
 * JWT Middleware - requires authentication for all routes
 * Use this as a guard for protected route groups
 */
export const jwtMiddleware = new Elysia({ name: 'jwt-middleware' }).derive(
	(ctx) => {
		const user = (ctx as unknown as { user: AuthUser | null }).user;
		if (!user) {
			throw new ApiError(HttpStatus.UNAUTHORIZED, 'Authentication required');
		}
		return { user };
	}
);
