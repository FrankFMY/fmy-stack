# FMY Stack

A personal TypeScript toolkit with focused packages for core utilities, runtime validation, Svelte UI, Elysia applications, and Drizzle ORM workflows.

[![CI](https://github.com/FrankFMY/fmy-stack/actions/workflows/ci.yml/badge.svg)](https://github.com/FrankFMY/fmy-stack/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

[Source](https://github.com/FrankFMY/fmy-stack) · [Issues](https://github.com/FrankFMY/fmy-stack/issues) · [Changelog](CHANGELOG.md)

## Packages and candidate releases

| Package | Scope | Prepared version |
| --- | --- | --- |
| [@frankfmy/core](packages/core/README.md) · [npm](https://www.npmjs.com/package/@frankfmy/core) | Dates, money, strings, phones, business identifiers, collections, functions, IDs, and cryptography | 1.1.2 |
| [@frankfmy/validation](packages/validation/README.md) · [npm](https://www.npmjs.com/package/@frankfmy/validation) | ArkType schemas and inferred types for identity, accounts, money, and request contracts | 1.1.2 |
| [@frankfmy/ui](packages/ui/README.md) · [npm](https://www.npmjs.com/package/@frankfmy/ui) | Svelte 5 and Tailwind v4 components for forms, tables, overlays, feedback, and themes | 1.1.2 |
| [@frankfmy/db-utils](packages/db-utils/README.md) · [npm](https://www.npmjs.com/package/@frankfmy/db-utils) | PostgreSQL/Drizzle schema helpers, pagination, search, soft deletion, transactions, bulk operations, and seeding | 2.0.0 |
| [@frankfmy/elysia-kit](packages/elysia-kit/README.md) · [npm](https://www.npmjs.com/package/@frankfmy/elysia-kit) | Elysia application setup, JWT authentication, errors, rate limiting, logging, and response helpers | 2.0.0 |

These are **release candidates pending publication**, not a claim that these versions are on npm. Registry links show published versions; unversioned installs resolve those published versions, which may have different APIs and licenses. The package READMEs describe the candidate source in this repository.

### Compatibility and migration

- Core and validation publish ESM JavaScript with TypeScript declarations. Core cryptography requires Web Crypto; Node 20+ and Bun provide the relevant runtime APIs.
- UI requires **Svelte 5 compilation for browser and SSR use**. Native Node.js cannot directly import the root because it includes `.svelte` modules. The exported `styles.css` only registers package sources with Tailwind v4; it is not precompiled component CSS. Follow the [UI setup](packages/ui/README.md#installation-and-required-css-setup), including the application stylesheet and dark variant.
- DB utilities 2.0.0 require the external peer **`drizzle-orm >=0.45.2 <1`**, replacing the earlier `>=0.30.0` range. Install and validate a compatible Drizzle version and PostgreSQL driver yourself. The narrower supported range is a breaking change.
- Elysia kit 2.0.0 requires the external peer **`elysia >=1.4.29 <2`**, replacing the earlier `^1` range. The bundle keeps framework dependencies and `jose` external; declared runtime dependencies are installed normally. Forwarded headers are **not trusted by default**. Rate limiting uses one anonymous bucket unless you explicitly configure a trusted proxy or a custom trustworthy identity. Review the [rate-limit policy](packages/elysia-kit/README.md#ratelimiterconfig-ratelimitconfig).
- Core creates PBKDF2-SHA256 password hashes at 600,000 iterations and verifies legacy SHA-256 and bcrypt in Node/Bun. Rehash only after successful verification and persist through a credential compare-and-swap. See [migration and bcrypt limitations](packages/core/README.md#password-hashing-and-migration).

## Quick start for contributors

```bash
git clone https://github.com/FrankFMY/fmy-stack.git
cd fmy-stack
bun install --frozen-lockfile
bun run verify
```

Use the Bun version declared in the root `packageManager` field. `bun run verify` runs formatting, linting, type/component checks, tests, builds, package-consumer checks, and a dependency audit. Package verification installs tarballs in isolated consumers and requires network access. Results depend on the checked-out source and installed dependencies; this README does not promise fixed test counts or an evergreen clean audit.

Publication is an **explicit, qualified maintainer operation**, separate from contributor verification. Automatic release-triggered publishing is disabled; maintainers qualify sealed artifacts before explicit provider publication. Do not assume creating a release or passing CI automatically publishes packages. No candidate listed here should be treated as published until its exact version is visible in the registry.

## Examples

These examples target the candidate APIs. See each package README for installation and full contracts.

### Core utilities

```typescript
import { formatDateRU, formatMoneyRU, groupBy, validateINN } from '@frankfmy/core';

formatDateRU(new Date(2026, 9, 24)); // '24 октября 2026'
formatMoneyRU(1234.56);             // '1 234,56 ₽'
validateINN('7707083893');          // true
const records = [{ id: 1, status: 'active' }, { id: 2, status: 'pending' }];
const byStatus = groupBy(records, 'status');
```

### Runtime validation

```typescript
import { UserCreateSchema, validate, type UserCreate } from '@frankfmy/validation';

const result = validate(UserCreateSchema, {
  email: 'user@example.com',
  password: 'Example-Passphrase-2026!',
  name: 'Example User'
});
if (!result.success) throw new Error('Invalid registration data');
const user: UserCreate = result.data;
// Call application-owned registration logic without logging the password.
```

Runtime validators use `*Schema` names. Short names such as `UserCreate` and `Email` are types, not callable values. Direct schema calls return data or ArkType `type.errors`, not ordinary Error instances.

### Elysia application

```typescript
import { createApp, rateLimiter, respond } from '@frankfmy/elysia-kit';

const app = createApp({
  name: 'Example API',
  cors: { origin: ['https://app.example.com'], credentials: true }
})
  .use(rateLimiter({ max: 100, windowMs: 60_000 }))
  .get('/health', () => respond.success({ ok: true }))
  .listen(3000);
// GET http://localhost:3000/api/health
```

This limiter shares one anonymous bucket across requests. Authentication is a separate opt-in plugin: install `authPlugin({ secret })` and use explicit `beforeHandle` guards or `jwtMiddleware`. Version 2.0.0 also repairs the `auth`/`roles` route-macro enforcement; protected handlers reject anonymous requests and unauthorized roles. See the [auth documentation](packages/elysia-kit/README.md#authpluginconfig-authconfig). Response helpers create bodies; they do not set HTTP status codes.

### Paginated result metadata

```typescript
import { buildPaginatedResult } from '@frankfmy/db-utils';

const rows = [{ id: '1', name: 'Example' }];
const result = await buildPaginatedResult(rows, 1, { page: 1, limit: 20 });
// result.data contains rows; result.meta contains pagination information.
```

The caller supplies real rows and the real total; this helper does not query the database. For executable Drizzle query composition, see [DB utilities](packages/db-utils/README.md).

## Quality gates

The aggregate command is `bun run verify`. Individual gates are also available:

```bash
bun run format:check
bun run lint
bun run check
bun run test
bun run build
bun run packages:check
bun audit
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidance and [SECURITY.md](SECURITY.md) for vulnerability reporting. Do not disclose credentials or private application data in public issues.

## Author

**Artem Prianishnikov**

- Email: [Pryanishnikovartem@gmail.com](mailto:Pryanishnikovartem@gmail.com)
- Additional email: [frankfmy@proton.me](mailto:frankfmy@proton.me)
- Telegram: [@FrankFMY](https://t.me/FrankFMY)
- LinkedIn: [frankfmy](https://www.linkedin.com/in/frankfmy/)
- X: [@FrankFMY](https://x.com/FrankFMY)
- Website: [frankfmy.com](https://frankfmy.com)
- GitHub: [FrankFMY](https://github.com/FrankFMY)
- npm: [~frankfmy](https://www.npmjs.com/~frankfmy)

## License

The current author-owned source is **Apache-2.0**, copyright © 2026 Artem Prianishnikov. See [LICENSE](LICENSE) and [NOTICE](NOTICE); third-party components retain their respective licenses.

Previously published releases **through 1.1.1 remain under their original PolyForm Noncommercial license**. The current-source license change is not retroactive and does not change historical release artifacts.
