# @frankfmy/elysia-kit

> ElysiaJS backend framework utilities

## Installation

```bash
bun add @frankfmy/elysia-kit elysia
```

## Quick Start

```typescript
import { createApp, authPlugin, rateLimiter, respond } from '@frankfmy/elysia-kit';

const app = createApp({
  name: 'My API',
  cors: { origin: true },
  swagger: { path: '/docs' }
})
  .use(authPlugin({ secret: process.env.JWT_SECRET! }))
  .use(rateLimiter({ max: 100 }))
  .get('/', () => respond.success({ message: 'Hello!' }))
  .listen(3000);

console.log(`🚀 Server running at ${app.server?.url}`);
```

## Features

### createApp

Pre-configured Elysia app with CORS, Swagger, error handling, and logging:

```typescript
import { createApp } from '@frankfmy/elysia-kit';

const app = createApp({
  name: 'My API',
  prefix: '/api',
  cors: {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  },
  swagger: {
    path: '/docs',
    documentation: {
      info: {
        title: 'My API',
        version: '1.0.0'
      }
    }
  },
  logging: true
});
```

### authPlugin

JWT authentication with role-based access:

```typescript
import { authPlugin, ApiError } from '@frankfmy/elysia-kit';

app
  .use(authPlugin({
    secret: 'your-secret-key',
    expiresIn: '7d',
    cookieName: 'auth_token',
    headerName: 'Authorization'
  }))
  // Protected route
  .get('/profile', ({ user }) => {
    return { user };
  }, { auth: true })
  // Role-based access
  .get('/admin', ({ user }) => {
    return { admin: true };
  }, { roles: ['admin'] });
```

### Middleware

#### Error Handler

```typescript
import { errorHandler, ApiError, HttpStatus } from '@frankfmy/elysia-kit';

app.use(errorHandler);

// Throw errors anywhere
throw new ApiError(HttpStatus.NOT_FOUND, 'User not found');
throw ApiError.badRequest('Invalid input', { field: 'email' });
throw ApiError.unauthorized();
throw ApiError.forbidden();
```

#### Rate Limiter

```typescript
import { rateLimiter } from '@frankfmy/elysia-kit';

app.use(rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // max requests per window
  message: 'Too many requests'
}));
```

#### Request Logger

```typescript
import { requestLogger } from '@frankfmy/elysia-kit';

app.use(requestLogger);
// Logs: → GET /api/users
// Logs: ← GET /api/users 200 15ms
```

### Response Helpers

```typescript
import { respond } from '@frankfmy/elysia-kit';

// Success response
respond.success({ user: { id: 1, name: 'John' } });
// { success: true, data: { user: {...} } }

// Error response
respond.error('Something went wrong', 500, { details: '...' });
// { success: false, error: '...', details: {...} }

// Paginated response
respond.paginated(users, 1, 20, 100);
// { success: true, data: [...], meta: { page: 1, limit: 20, total: 100, totalPages: 5 } }

// Created response
respond.created({ id: 1 });
// { success: true, data: { id: 1 } }

// No content
respond.noContent();
// { success: true }
```

### Error Handling

```typescript
import { ApiError, HttpStatus } from '@frankfmy/elysia-kit';

// Using static methods
throw ApiError.badRequest('Invalid email format');
throw ApiError.unauthorized('Token expired');
throw ApiError.forbidden('Insufficient permissions');
throw ApiError.notFound('User not found');
throw ApiError.conflict('Email already exists');
throw ApiError.internal('Database connection failed');

// Using constructor
throw new ApiError(HttpStatus.UNPROCESSABLE_ENTITY, 'Validation failed', {
  errors: [
    { field: 'email', message: 'Invalid format' }
  ]
});
```

## Example API

```typescript
import { createApp, authPlugin, rateLimiter, ApiError, respond } from '@frankfmy/elysia-kit';
import { t } from 'elysia';

const app = createApp()
  .use(authPlugin({ secret: process.env.JWT_SECRET! }))
  .use(rateLimiter())
  
  // Public routes
  .post('/login', async ({ body, jwt, cookie }) => {
    const user = await authenticateUser(body.email, body.password);
    if (!user) throw ApiError.unauthorized('Invalid credentials');
    
    const token = await jwt.sign({ sub: user.id, role: user.role });
    cookie.auth_token.set({ value: token, httpOnly: true });
    
    return respond.success({ user, token });
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 8 })
    })
  })
  
  // Protected routes
  .group('/users', { auth: true }, (app) =>
    app
      .get('/', async () => {
        const users = await getUsers();
        return respond.success(users);
      })
      .get('/:id', async ({ params }) => {
        const user = await getUser(params.id);
        if (!user) throw ApiError.notFound('User not found');
        return respond.success(user);
      })
      .post('/', async ({ body, user }) => {
        const newUser = await createUser(body, user.id);
        return respond.created(newUser);
      }, { roles: ['admin'] })
  )
  
  .listen(3000);
```

## License

Apache-2.0 © 2026 Artem Prianishnikov

