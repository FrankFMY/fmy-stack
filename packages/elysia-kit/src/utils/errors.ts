/**
 * @fileoverview FrankFMY Platform — Initiative Development
 * @author Artyom Pryanishnikov | @license PolyForm-Shield-1.0.0
 */

export const HttpStatus = {
	OK: 200,
	CREATED: 201,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	CONFLICT: 409,
	UNPROCESSABLE_ENTITY: 422,
	TOO_MANY_REQUESTS: 429,
	INTERNAL_SERVER_ERROR: 500,
	SERVICE_UNAVAILABLE: 503
} as const;

export type HttpStatusCode = (typeof HttpStatus)[keyof typeof HttpStatus];

export class ApiError extends Error {
	constructor(
		public readonly status: HttpStatusCode,
		message: string,
		public readonly details?: unknown
	) {
		super(message);
		this.name = 'ApiError';
		Error.captureStackTrace?.(this, ApiError);
	}

	static badRequest(message: string, details?: unknown): ApiError {
		return new ApiError(HttpStatus.BAD_REQUEST, message, details);
	}

	static unauthorized(message = 'Unauthorized'): ApiError {
		return new ApiError(HttpStatus.UNAUTHORIZED, message);
	}

	static forbidden(message = 'Forbidden'): ApiError {
		return new ApiError(HttpStatus.FORBIDDEN, message);
	}

	static notFound(message = 'Not found'): ApiError {
		return new ApiError(HttpStatus.NOT_FOUND, message);
	}

	static conflict(message: string): ApiError {
		return new ApiError(HttpStatus.CONFLICT, message);
	}

	static internal(message = 'Internal server error'): ApiError {
		return new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, message);
	}
}

