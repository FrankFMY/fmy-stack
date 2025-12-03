/**
 * @fileoverview Tests for jwtMiddleware
 */

import { describe, expect, test } from 'bun:test';
import { Elysia } from 'elysia';
import { jwtMiddleware } from '../auth/jwtMiddleware.js';

describe('jwtMiddleware', () => {
	test('should be an Elysia plugin', () => {
		expect(jwtMiddleware).toBeDefined();
		expect(jwtMiddleware).toBeInstanceOf(Elysia);
	});

	test('should have correct name', () => {
		// jwtMiddleware is instantiated with name 'jwt-middleware'
		const config = (jwtMiddleware as unknown as { config: { name: string } }).config;
		expect(config.name).toBe('jwt-middleware');
	});

	test('should be usable with Elysia app', () => {
		// Verify the middleware can be added to an app without errors
		const app = new Elysia().use(jwtMiddleware);
		expect(app).toBeDefined();
	});
});
