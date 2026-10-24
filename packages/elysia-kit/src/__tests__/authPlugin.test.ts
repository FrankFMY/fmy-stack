import { describe, expect, test } from 'bun:test';
import { Elysia } from 'elysia';
import { SignJWT } from 'jose';
import { authPlugin } from '../auth/authPlugin.js';

const SECRET = 'test-secret-key-for-jwt-signing-minimum-32-chars';

describe('authPlugin', () => {
	test('auth route flag rejects anonymous requests before the handler runs', async () => {
		let calls = 0;
		const app = new Elysia().use(authPlugin({ secret: SECRET })).get(
			'/private',
			() => {
				calls++;
				return 'private';
			},
			{ auth: true }
		);
		expect((await app.handle(new Request('http://localhost/private'))).status).toBe(401);
		expect(calls).toBe(0);
	});

	test('roles flag denies an authenticated different role and accepts the allowed role', async () => {
		const app = new Elysia()
			.use(authPlugin({ secret: SECRET }))
			.get('/admin', ({ user }) => user?.id, { roles: ['admin'] });
		for (const [role, expected] of [
			['member', 403],
			['admin', 200]
		] as const) {
			const token = await new SignJWT({ sub: 'actor', email: 'actor@example.com', role })
				.setProtectedHeader({ alg: 'HS256' })
				.setExpirationTime('1h')
				.sign(new TextEncoder().encode(SECRET));
			const response = await app.handle(
				new Request('http://localhost/admin', {
					headers: { authorization: `Bearer ${token}` }
				})
			);
			expect(response.status).toBe(expected);
		}
		expect((await app.handle(new Request('http://localhost/admin'))).status).toBe(401);
	});

	test('auth flag accepts a valid cookie but rejects a forged bearer token', async () => {
		const app = new Elysia()
			.use(authPlugin({ secret: SECRET }))
			.get('/private', ({ user }) => user?.id, { auth: true })
			.get('/public', () => 'public', { auth: false });
		const token = await new SignJWT({ sub: 'actor', email: 'actor@example.com' })
			.setProtectedHeader({ alg: 'HS256' })
			.setExpirationTime('1h')
			.sign(new TextEncoder().encode(SECRET));
		expect(
			(
				await app.handle(
					new Request('http://localhost/private', {
						headers: { cookie: `auth_token=${token}` }
					})
				)
			).status
		).toBe(200);
		expect(
			(
				await app.handle(
					new Request('http://localhost/private', {
						headers: { authorization: `Bearer ${token}forged` }
					})
				)
			).status
		).toBe(401);
		expect((await app.handle(new Request('http://localhost/public'))).status).toBe(200);
	});
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
