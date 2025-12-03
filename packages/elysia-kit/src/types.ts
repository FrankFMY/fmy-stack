/**
 * @fileoverview FrankFMY Platform — Initiative Development
 * @author Artyom Pryanishnikov | @license PolyForm-Shield-1.0.0
 */

import type { Elysia } from 'elysia';

export type ElysiaApp = Elysia;

export interface Context {
	request: Request;
	path: string;
	params: Record<string, string>;
	query: Record<string, string | undefined>;
	headers: Record<string, string | undefined>;
	body: unknown;
	set: {
		headers: Record<string, string>;
		status?: number;
		redirect?: string;
	};
}

export interface JwtPayload {
	sub: string;
	exp: number;
	iat: number;
	role?: string;
	email?: string;
	[key: string]: unknown;
}

export interface AuthUser {
	id: string;
	email?: string | undefined;
	role?: string | undefined;
	[key: string]: unknown;
}
