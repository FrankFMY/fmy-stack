# @frankfmy/elysia-kit

Elysia application setup, JWT authentication, request middleware, API errors, and response helpers for Bun backends.

[npm](https://www.npmjs.com/package/@frankfmy/elysia-kit) · [Source](https://github.com/FrankFMY/fmy-stack/tree/main/packages/elysia-kit) · [Issues](https://github.com/FrankFMY/fmy-stack/issues) · [Author](../../README.md#author)

## Release status and compatibility

This README documents the **2.0.0 API contract**. The npm link identifies available published versions; use the matching package version for the middleware and compatibility contracts below.

Version 2.0.0 requires Elysia `>=1.4.29 <2`, replacing the previous broad `^1` peer range. It is an ESM package intended for Bun. Elysia remains a consumer-provided peer; the build keeps dependencies external, including `elysia` and `jose`. `jose` is a declared runtime dependency, not bundled code or an additional peer you must install manually.

```bash
# Select the matching published package and a compatible Elysia peer.
bun add @frankfmy/elysia-kit 'elysia@>=1.4.29 <2'
```

For migration, review the stricter Elysia peer range and rate-limit identity policy below. Forwarded IP headers are not trusted by default.

## Quick start

```typescript
import { createApp, rateLimiter, respond } from '@frankfmy/elysia-kit';

const app = createApp({
  name: 'My API',
  cors: { origin: ['https://app.example.com'], credentials: true },
  swagger: { path: '/docs' }
})
  .use(rateLimiter({ max: 100, windowMs: 60_000 }))
  .get('/health', () => respond.success({ ok: true }))
  .listen(3000);

// The default prefix makes this route GET /api/health.
console.log(`Server running at ${app.server?.url}`);
```

The limiter in this example shares one anonymous bucket across requests. It does not infer a trustworthy client IP from a Web `Request`.

## Public API

The package exports `createApp`, `authPlugin`, `jwtMiddleware`, `errorHandler`, `requestLogger`, `rateLimiter`, `ApiError`, `HttpStatus`, and `respond` from its root. Root type exports are `AppConfig`, `AuthConfig`, `RateLimitConfig`, `ApiResponse`, `Context`, and `ElysiaApp`.

### createApp(config?: AppConfig)

Returns an Elysia instance with the error handler, CORS, Swagger documentation, and optional request logging.

```typescript
import { createApp } from '@frankfmy/elysia-kit';

const app = createApp({
  name: 'My API',
  prefix: '/api',
  cors: {
    origin: ['https://app.example.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  },
  swagger: {
    path: '/docs',
    documentation: {
      info: {
        title: 'My API',
        version: '1.0.0',
        description: 'Application endpoints'
      }
    }
  },
  logging: true
});
```

Defaults:

- `name`: `'FrankFMY API'`; `prefix`: `'/api'`.
- CORS: `origin: true`, `credentials: true`, methods `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, and `OPTIONS`. Configure an explicit origin allowlist for your deployment.
- Swagger: `path: '/docs'`, with title `'FrankFMY API'`, version `'1.0.0'`, and description `'API documentation'`.
- `logging: true`; set `logging: false` to skip the request logger.

Configuration is shallow-merged with the defaults, not recursively merged. The typed CORS and Swagger options are configuration objects, not boolean enable/disable switches. The error handler is always installed. Use an ordinary `new Elysia()` and the individual plugins when you need a different composition.

### authPlugin(config: AuthConfig)

Adds JWT signing/verification through the `jwt` context helper and derives `user` and `token` for each request. A secret is required; load a strong secret from your environment rather than hard-coding it.

```typescript
import { ApiError, authPlugin, createApp } from '@frankfmy/elysia-kit';

const secret = process.env.JWT_SECRET;
if (!secret) throw new Error('JWT_SECRET is required');

const app = createApp()
  .use(authPlugin({
    secret,
    expiresIn: '7d',
    cookieName: 'auth_token',
    headerName: 'Authorization'
  }))
  .get('/profile', ({ user }) => ({ user }), {
    beforeHandle: ({ user }) => {
      if (!user) throw ApiError.unauthorized('Authentication required');
    }
  })
  .get('/admin', ({ user }) => ({ user }), {
    beforeHandle: ({ user }) => {
      if (!user) throw ApiError.unauthorized('Authentication required');
      if (user.role !== 'admin') throw ApiError.forbidden('Insufficient permissions');
    }
  });
```

`expiresIn`, `cookieName`, and `headerName` default to the values shown above. The plugin checks for a case-sensitive `Bearer ` prefix in the configured header, then falls back to the configured cookie when no Bearer header is present. An invalid Bearer token does not fall back to a cookie.

- A verified token maps `sub` to `user.id`, with `email` and `role` copied from its claims.
- Missing or invalid tokens produce `user: null` and `token: null`; the plugin alone does **not** make every route private.
- The explicit `beforeHandle` guards above enforce authentication (401) and role authorization (403).
- The declared macro API uses route options `{ auth: true }` and `{ roles: ['admin'] }`, not `.auth()` or `.roles()` chain methods. Version 2.0.0 corrects registration of these macros for the supported Elysia lifecycle. Anonymous and invalid-token requests are rejected with 401; authenticated users without an allowed role receive 403. Explicit guards remain available when applications need additional policy.

The `jwt.sign` helper accepts claims such as `{ sub: userId, role: 'admin' }`. Your application must authenticate credentials before signing tokens and must implement its own user lookup, session policy, and secure cookie handling. No login, database, or credential-verification functions are supplied by this package.

### jwtMiddleware

An already-created Elysia plugin, not a function. Install `authPlugin` first; `jwtMiddleware` checks the derived `user` and throws a 401 `ApiError` if it is absent. It does not independently verify tokens.

```typescript
import { authPlugin, createApp, jwtMiddleware } from '@frankfmy/elysia-kit';

const secret = process.env.JWT_SECRET;
if (!secret) throw new Error('JWT_SECRET is required');

const app = createApp()
  .use(authPlugin({ secret }))
  .group('/protected', (group) => group
    .use(jwtMiddleware)
    .get('/profile', ({ user }) => ({ user }))
    .get('/settings', ({ user }) => ({ userId: user.id }))
  );
```

### rateLimiter(config?: RateLimitConfig)

An in-memory, fixed-window limiter. Install it before the routes you want to limit.

```typescript
import { createApp, rateLimiter } from '@frankfmy/elysia-kit';

const app = createApp().use(rateLimiter({
  windowMs: 60_000,
  max: 100,
  maxEntries: 10_000,
  trustProxy: false,
  message: 'Too many requests'
}));
```

| Option | Default | Meaning |
| --- | --- | --- |
| `windowMs` | `60_000` | Fixed window duration in milliseconds |
| `max` | `100` | Requests allowed per identity in a window |
| `maxEntries` | `10_000` | Bound on the identity map; additional identities share an overflow bucket |
| `trustProxy` | `false` | Opt in to using forwarded IP headers as identity |
| `keyGenerator` | Global anonymous identity | Synchronous `(request: Request) => string` identity function; overrides proxy handling |
| `message` | `'Too many requests, please try again later'` | Error message on exceeding the limit |

**Identity is a security boundary.** By default, all requests share one `anonymous` bucket because a Web `Request` does not expose an authoritative peer IP. Client-supplied `X-Forwarded-For` and `X-Real-IP` headers cannot create separate buckets with `trustProxy: false`.

Set `trustProxy: true` only behind a configured trusted proxy that overwrites those headers and prevents clients from bypassing it. In that mode, identity comes from the first `X-Forwarded-For` value, then `X-Real-IP`, then `anonymous`. For application-owned identity, pass a `keyGenerator` that obtains a verified session or tenant identifier from the request. Do not use an arbitrary client-controlled header or an unverified JWT claim as an authenticated identity. The limiter runs in `onRequest`, before JWT-derived context is available, so the callback receives the raw `Request`, not the user derived later by `authPlugin`.

Buckets expire through request-driven cleanup; there is no background interval. The identity map is bounded, and new identities share an overflow bucket when capacity is reached instead of evicting active identities and resetting their quotas. This limits identity churn but can group unrelated clients together. State is local to each limiter instance and process, not shared across replicas; use an edge or shared-store limiter for distributed enforcement.

Exceeding a bucket's limit throws a 429 `ApiError`. Subsequent requests in an existing window receive `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers; the reset value is a Unix timestamp in seconds. A newly created bucket's first response does not receive these headers.

### errorHandler and ApiError

`createApp` already installs `errorHandler`. With a plain Elysia app, install the exported plugin directly:

```typescript
import { Elysia } from 'elysia';
import { errorHandler, ApiError, HttpStatus } from '@frankfmy/elysia-kit';

const app = new Elysia()
  .use(errorHandler)
  .get('/missing', () => {
    throw new ApiError(HttpStatus.NOT_FOUND, 'User not found');
  });
```

`ApiError` carries `status`, `message`, and optional `details`. Available constructors include:

```typescript
import { ApiError, HttpStatus } from '@frankfmy/elysia-kit';

ApiError.badRequest('Invalid email format', { field: 'email' });
ApiError.unauthorized('Token expired');
ApiError.forbidden('Insufficient permissions');
ApiError.notFound('User not found');
ApiError.conflict('Email already exists');
ApiError.internal('Database connection failed');

new ApiError(HttpStatus.UNPROCESSABLE_ENTITY, 'Validation failed', {
  errors: [{ field: 'email', message: 'Invalid format' }]
});
```

Throw these errors to use the handler's HTTP status and standardized `{ success: false, error, details? }` body. The handler maps Elysia validation errors to 400 and unknown errors to 500. Unknown-error messages are hidden when `NODE_ENV=production`; application-provided `ApiError` messages and details are still returned, so do not put secrets in them.

### requestLogger

An already-created plugin that logs the incoming method/path and the outgoing method/path, status, and elapsed milliseconds. `createApp` includes it unless `logging: false`.

```typescript
import { createApp, requestLogger } from '@frankfmy/elysia-kit';

const app = createApp({ logging: false }).use(requestLogger);
// Logs incoming method/path, then outgoing method/path, status, and elapsed time.
```

### Response helpers

These helpers create plain response bodies; they do **not** set the HTTP status. In particular, `respond.error` ignores its optional status argument, `respond.created` does not set 201, and `respond.noContent` returns a JSON body rather than an empty HTTP 204 response.

```typescript
import { respond } from '@frankfmy/elysia-kit';

respond.success({ user: { id: '1', name: 'John' } });
// { success: true, data: { user: { id: '1', name: 'John' } } }

respond.error('Something went wrong', 500, { reason: 'unavailable' });
// { success: false, error: 'Something went wrong', details: { reason: 'unavailable' } }

respond.paginated([], 1, 20, 0);
// { success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }

respond.created({ id: '1' });
// { success: true, data: { id: '1' } }

respond.noContent();
// { success: true }
```

`respond.success(data, meta?)` accepts optional pagination metadata. `respond.paginated(data, page, limit, total)` calculates `totalPages`; validate pagination inputs in your application. Set Elysia's `set.status` explicitly when returning an HTTP 201 or another non-default status, or throw `ApiError` for errors handled by `errorHandler`.

The `swagger` configuration name remains supported in 2.0.0, backed by the maintained `@elysiajs/openapi` plugin. The UI stays at the configured path (under your application prefix), and its specification stays at `<path>/json`. The generated document uses the maintained plugin’s OpenAPI version; validate custom integrations against it. The interactive documentation may load its UI assets from the plugin’s configured CDN.

## Author

**Artem Prianishnikov** — [root author details](../../README.md#author).

## License

Current owned source is **Apache-2.0**, copyright © 2026 Artem Prianishnikov. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

Historical releases **through 1.1.1 remain under their original PolyForm license**. The current source license does not retroactively change those release artifacts.
