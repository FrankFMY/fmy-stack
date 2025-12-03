/**
 * @frankfmy/elysia-kit - Usage Example
 *
 * Run: bun run examples/usage-elysia.ts
 */

import { ApiError, authPlugin, createApp, rateLimiter, respond } from '@frankfmy/elysia-kit';
import { t } from 'elysia';

// ============================================
// APP CONFIGURATION
// ============================================

const app = createApp({
	name: 'FrankFMY Example API',
	prefix: '/api',
	cors: {
		origin: ['http://localhost:3000'],
		credentials: true
	},
	swagger: {
		path: '/docs',
		documentation: {
			info: {
				title: 'FrankFMY Example API',
				version: '1.0.0',
				description: 'Example API built with @frankfmy/elysia-kit'
			}
		}
	},
	logging: true
});

// ============================================
// MIDDLEWARE
// ============================================

app
	.use(
		authPlugin({
			secret: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
			expiresIn: '7d'
		})
	)
	.use(
		rateLimiter({
			max: 100,
			windowMs: 60 * 1000,
			message: 'Too many requests, please try again later'
		})
	);

// ============================================
// PUBLIC ROUTES
// ============================================

app
	.get('/', () => {
		return respond.success({
			message: 'Welcome to FrankFMY Example API',
			version: '1.0.0',
			docs: '/api/docs'
		});
	})
	.get('/health', () => {
		return respond.success({
			status: 'healthy',
			timestamp: new Date().toISOString()
		});
	});

// ============================================
// AUTH ROUTES
// ============================================

// Mock users database
const users = new Map([
	[
		'1',
		{
			id: '1',
			email: 'admin@example.com',
			password: '$2b$10$...', // hashed password
			role: 'admin',
			name: 'Admin User'
		}
	],
	[
		'2',
		{
			id: '2',
			email: 'user@example.com',
			password: '$2b$10$...',
			role: 'user',
			name: 'Regular User'
		}
	]
]);

app
	.post(
		'/auth/login',
		async ({ body, jwt, cookie }) => {
			const { email, password: _password } = body;

			// Find user by email
			const user = Array.from(users.values()).find((u) => u.email === email);

			if (!user) {
				throw ApiError.unauthorized('Invalid credentials');
			}

			// In real app, verify password with Bun.password.verify
			// const valid = await Bun.password.verify(password, user.password);

			// Generate JWT token
			const token = await jwt.sign({
				sub: user.id,
				email: user.email,
				role: user.role
			});

			// Set cookie
			cookie.auth_token.set({
				value: token,
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 7 * 24 * 60 * 60 // 7 days
			});

			return respond.success({
				user: {
					id: user.id,
					email: user.email,
					name: user.name,
					role: user.role
				},
				token
			});
		},
		{
			body: t.Object({
				email: t.String({ format: 'email' }),
				password: t.String({ minLength: 8 })
			})
		}
	)
	.post('/auth/logout', ({ cookie }) => {
		cookie.auth_token.remove();
		return respond.success({ message: 'Logged out successfully' });
	});

// ============================================
// PROTECTED ROUTES
// ============================================

app
	// Get current user profile
	.get(
		'/users/me',
		({ user }) => {
			const userData = users.get(user.id);
			if (!userData) {
				throw ApiError.notFound('User not found');
			}

			return respond.success({
				id: userData.id,
				email: userData.email,
				name: userData.name,
				role: userData.role
			});
		},
		{ auth: true }
	)

	// List all users (admin only)
	.get(
		'/users',
		() => {
			const allUsers = Array.from(users.values()).map((u) => ({
				id: u.id,
				email: u.email,
				name: u.name,
				role: u.role
			}));

			return respond.paginated(allUsers, 1, 20, allUsers.length);
		},
		{ auth: true, roles: ['admin'] }
	)

	// Get user by ID
	.get(
		'/users/:id',
		({ params }) => {
			const user = users.get(params.id);
			if (!user) {
				throw ApiError.notFound('User not found');
			}

			return respond.success({
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role
			});
		},
		{ auth: true }
	)

	// Create new user (admin only)
	.post(
		'/users',
		async ({ body }) => {
			// Check if email already exists
			const existing = Array.from(users.values()).find((u) => u.email === body.email);
			if (existing) {
				throw ApiError.conflict('Email already exists');
			}

			// Create user
			const id = String(users.size + 1);
			const newUser = {
				id,
				email: body.email,
				password: body.password, // In real app, hash with Bun.password.hash
				name: body.name,
				role: body.role || 'user'
			};

			users.set(id, newUser);

			return respond.created({
				id: newUser.id,
				email: newUser.email,
				name: newUser.name,
				role: newUser.role
			});
		},
		{
			auth: true,
			roles: ['admin'],
			body: t.Object({
				email: t.String({ format: 'email' }),
				password: t.String({ minLength: 8 }),
				name: t.String({ minLength: 2 }),
				role: t.Optional(t.Union([t.Literal('admin'), t.Literal('user')]))
			})
		}
	)

	// Delete user (admin only)
	.delete(
		'/users/:id',
		({ params }) => {
			if (!users.has(params.id)) {
				throw ApiError.notFound('User not found');
			}

			users.delete(params.id);
			return respond.noContent();
		},
		{ auth: true, roles: ['admin'] }
	);

// ============================================
// ERROR DEMONSTRATION
// ============================================

app
	.get('/errors/bad-request', () => {
		throw ApiError.badRequest('Invalid input data', {
			field: 'email',
			message: 'Email format is invalid'
		});
	})
	.get('/errors/unauthorized', () => {
		throw ApiError.unauthorized('Please log in to continue');
	})
	.get('/errors/forbidden', () => {
		throw ApiError.forbidden('You do not have access to this resource');
	})
	.get('/errors/not-found', () => {
		throw ApiError.notFound('The requested resource was not found');
	})
	.get('/errors/internal', () => {
		throw ApiError.internal('Something went wrong on our end');
	});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`
🚀 FrankFMY Example API

Server: http://localhost:${PORT}
API:    http://localhost:${PORT}/api
Docs:   http://localhost:${PORT}/api/docs

Available endpoints:
  GET  /api              - Welcome message
  GET  /api/health       - Health check
  POST /api/auth/login   - Login
  POST /api/auth/logout  - Logout
  GET  /api/users/me     - Current user (auth required)
  GET  /api/users        - List users (admin only)
  GET  /api/users/:id    - Get user by ID (auth required)
  POST /api/users        - Create user (admin only)
  DELETE /api/users/:id  - Delete user (admin only)

Test credentials:
  Email: admin@example.com
  Password: password123
  `);
});

export default app;
