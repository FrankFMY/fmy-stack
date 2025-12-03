/**
 * @fileoverview FrankFMY Platform — Initiative Development
 * @author Artyom Pryanishnikov | @license PolyForm-Shield-1.0.0
 */

import { Elysia } from 'elysia';
import { ApiError, HttpStatus } from '../utils/errors.js';
import { respond } from '../utils/response.js';

export const errorHandler = new Elysia({ name: 'error-handler' }).onError(
	({ error, set }) => {
		// Handle our custom ApiError
		if (error instanceof ApiError) {
			set.status = error.status;
			return respond.error(error.message, error.status, error.details);
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
	}
);
