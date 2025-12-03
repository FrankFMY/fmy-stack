import { describe, expect, test } from 'bun:test';
import { Elysia } from 'elysia';
import { SignJWT } from 'jose';
import { authPlugin } from '../auth/authPlugin.js';

const SECRET = 'test-secret-key-for-jwt-signing-minimum-32-chars';

describe('authPlugin', () => {
	test('should allow access without token', async () => {
		const app = new Elysia()
			.use(authPlugin({ secret: SECRET }))
			.get('/public', () => ({ message: 'ok' }));
		const response = await app.handle(new Request('http://localhost/public'));
		expect(response.status).toBe(200);
	});

	test('should extract user from Bearer token', async () => {
		const token = await new SignJWT({ sub: 'user-123', email: 'test@example.com' })
			.setProtectedHeader({ alg: 'HS256' })
			.setExpirationTime('1h')
			.sign(new TextEncoder().encode(SECRET));

		const app = new Elysia()
			.use(authPlugin({ secret: SECRET }))
			.get('/profile', (ctx) => ({ user: (ctx as { user?: unknown }).user }));

		const response = await app.handle(
			new Request('http://localhost/profile', {
				headers: { Authorization: `Bearer ${token}` }
			})
		);
		expect(response.status).toBe(200);
		const body = await response.json();
		expect(body.user).not.toBeNull();
	});

	test('should return null user without token', async () => {
		const app = new Elysia()
			.use(authPlugin({ secret: SECRET }))
			.get('/protected', (ctx) => ({ user: (ctx as { user?: unknown }).user ?? null }));
		const response = await app.handle(new Request('http://localhost/protected'));
		const body = await response.json();
		expect(body.user).toBeNull();
	});
});
