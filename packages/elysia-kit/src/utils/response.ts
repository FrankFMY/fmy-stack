/**
 * @fileoverview FrankFMY Platform — Initiative Development
 * @author Artyom Pryanishnikov | @license PolyForm-Shield-1.0.0
 */

import type { HttpStatusCode } from './errors.js';

export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	details?: unknown;
	meta?: {
		page?: number;
		limit?: number;
		total?: number;
		totalPages?: number;
	};
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export const respond = {
	success<T>(data: T, meta?: ApiResponse['meta']): ApiResponse<T> {
		const response: ApiResponse<T> = {
			success: true,
			data
		};
		if (meta) {
			response.meta = meta;
		}
		return response;
	},

	error(
		message: string,
		_status?: HttpStatusCode,
		details?: unknown
	): ApiResponse {
		const response: ApiResponse = {
			success: false,
			error: message
		};
		if (details !== undefined) {
			response.details = details;
		}
		return response;
	},

	paginated<T>(
		data: T[],
		page: number,
		limit: number,
		total: number
	): PaginatedResponse<T> {
		return {
			success: true,
			data,
			meta: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		};
	},

	created<T>(data: T): ApiResponse<T> {
		return {
			success: true,
			data
		};
	},

	noContent(): ApiResponse {
		return {
			success: true
		};
	}
};
