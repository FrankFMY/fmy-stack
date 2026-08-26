# FMY Stack

A personal TypeScript toolkit monorepo with focused packages for core utilities, runtime validation, Svelte UI, Elysia applications, and Drizzle ORM workflows.

I built these packages to keep recurring product-system concerns explicit and testable without copying ad-hoc helpers between applications.

[![CI](https://github.com/FrankFMY/fmy-stack/actions/workflows/ci.yml/badge.svg)](https://github.com/FrankFMY/fmy-stack/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Bun](https://img.shields.io/badge/Bun-1.4+-black)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-blue)](https://typescriptlang.org)

## Packages

| Package | Scope | Verification |
|---|---|---|
| `@frankfmy/core` | Dates, money, strings, phone normalization, business identifiers, collections, functions, IDs and cryptographic helpers | 234 tests / 607 assertions |
| `@frankfmy/validation` | ArkType schemas for identity, accounts, money, passwords, pagination and common request contracts | 46 tests / 72 assertions |
| `@frankfmy/db-utils` | Drizzle pagination, search, soft deletion, transaction retry, batch operations and seeding | 43 tests / 67 assertions |
| `@frankfmy/elysia-kit` | Elysia application setup, auth helpers, errors, rate limiting, logging and response contracts | 34 tests / 53 assertions |
| `@frankfmy/ui` | Svelte 5 + Tailwind components for forms, tables, pagination, overlays, feedback and themes | strict Svelte check and package build |

## Repository status

The source repository is public. Every workspace package remains marked `private: true`; npm publication is intentionally deferred until package-level API, tarball, consumer, provenance, and SemVer release gates are completed.

## Quick start

```bash
git clone https://github.com/FrankFMY/fmy-stack.git
cd fmy-stack
bun install --frozen-lockfile
bun run verify
```

## Examples

### Core utilities

```ts
import {
  formatDateRU,
  formatMoneyRU,
  groupBy,
  validateINN,
} from "@frankfmy/core";

formatDateRU(new Date());
formatMoneyRU(1_234.56);
validateINN("7707083893");
groupBy(records, "status");
```

### Validation

```ts
import {
  Email,
  INN,
  PasswordStrong,
  UserCreate,
} from "@frankfmy/validation";

const result = UserCreate({
  email: "user@example.com",
  password: "Example-Passphrase-2026!",
  firstName: "Example",
  lastName: "User",
});
```

### Elysia

```ts
import {
  ApiError,
  authPlugin,
  createApp,
  rateLimiter,
  respond,
} from "@frankfmy/elysia-kit";

const app = createApp({ name: "Example API" })
  .use(authPlugin({ secret: process.env.JWT_SECRET! }))
  .use(rateLimiter({ max: 100, windowMs: 60_000 }))
  .get("/health", () => respond.success({ ok: true }))
  .listen(3000);
```

### Drizzle

```ts
import {
  buildPaginatedResult,
  paginate,
  runTransactionWithRetry,
} from "@frankfmy/db-utils";

const page = await paginate(query, { page: 1, limit: 20 });
await runTransactionWithRetry(db, async (tx) => {
  // transaction-owned writes
});
```

## Quality gates

```bash
bun run format:check
bun run lint
bun run check
bun run test
bun run build
bun audit
```

The current clean gate uses Bun 1.4, TypeScript 6, Svelte 5, Vite 8, Turbo 2, Drizzle ORM 0.45, and Elysia 1.4 with zero known dependency advisories.

## Author

**Artem Prianishnikov**

- GitHub: https://github.com/FrankFMY
- Website: https://frankfmy.com
- Email: Pryanishnikovartem@gmail.com

## License

Apache-2.0 © 2026 Artem Prianishnikov. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
