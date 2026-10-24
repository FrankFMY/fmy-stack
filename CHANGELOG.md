# Changelog

This file describes prepared changes, not a record of completed npm publication. Exact published versions are listed on each package's npm page linked from the [root README](README.md#packages-and-candidate-releases).

## Unreleased — candidate core/validation/ui 1.1.2; db-utils/elysia-kit 2.0.0

### Breaking compatibility changes

- **@frankfmy/db-utils 2.0.0:** require consumer-provided `drizzle-orm >=0.45.2 <1` instead of the former `>=0.30.0` peer range. Keep Drizzle external rather than bundling it. Consumers must install a compatible peer and check their PostgreSQL queries and migrations.
- **@frankfmy/elysia-kit 2.0.0:** require consumer-provided `elysia >=1.4.29 <2` instead of the former `^1` peer range. Keep framework and runtime dependencies, including `jose`, external to the bundle.
- **Rate-limit identity:** `trustProxy` defaults to false. Requests share one global anonymous bucket by default because a Web Request does not expose an authoritative peer IP. Deployments needing per-client limits must explicitly configure a trustworthy `keyGenerator` or enable proxy trust only behind a controlled proxy that overwrites forwarded headers and cannot be bypassed.

These peer-range and identity-policy changes are major-version candidates, not patch-compatible updates to db-utils or elysia-kit.

### Security and correctness

- Core creates portable PBKDF2-SHA256 password hashes at 600,000 iterations. Legacy SHA-256 and bcrypt verification remains available in Node and Bun; bcrypt uses `bcryptjs`.
- Expose `passwordHashNeedsRehash` for migration **after successful verification**. The application owns credential persistence and must use compare-and-swap to avoid overwriting a concurrent password change. Legacy bcrypt's 72-byte truncation and uncapped encoded cost remain migration/resource considerations; input-length bounds do not eliminate them.
- Bound password/hash inputs, generated OTP/password lengths, and bulk chunk sizes; use rejection sampling for bounded cryptographic random integers.
- Map upsert schema-property keys to physical PostgreSQL column names and quote raw bulk-update identifiers.
- Bound rate-limit identity maps with shared overflow handling and request-driven cleanup, without a background interval. Keep limiter-instance state independent.
- Scope the error handler to consuming routes so production exception bodies are sanitized, while preserving framework404/400 and structured application errors.
- Preserve derived auth/JWT context through scoped Elysia plugins. `jwtMiddleware` is a plugin instance installed after `authPlugin`. Register `{ auth: true }` and `{ roles: [...] }` as Elysia macro hook objects so the route flags enforce 401/403 before handlers execute; cover anonymous, forged-token, cookie, allowed-role and denied-role requests.

### Dependency qualification

- Move API documentation to the maintained `@elysiajs/openapi` plugin while preserving the public `swagger` configuration, configured UI route, and `/json` specification endpoint. This removes the obsolete Swagger/Scalar/Zod runtime chain.
- Update Vite within version 8 and constrain the same-major devalue/source-map-js development dependencies to patched releases after actual advisory checks. No cross-major Zod override is used.

### Packaging and documentation

- Prepare **1.1.2** for core, validation, and UI, and **2.0.0** for db-utils and elysia-kit; publication is pending.
- Include LICENSE and NOTICE in package artifacts, avoid workspace protocols in consumer dependencies, keep framework peers external, and exclude test files from declaration/package output.
- Provide `@frankfmy/ui/styles.css` as a Tailwind v4 **source-registration** export. It is not precompiled CSS; applications must process Tailwind and compile the root `.svelte` modules for client and SSR use. Native Node root imports are not supported.
- Qualify package tarballs with isolated consumer installation/export checks, dependency-tree checks, and production audits. Contributors run `bun run verify`; successful local gates alone do not authorize publication.
- Move release operation from automatic release-triggered OIDC publishing toward local sealed-provider staging and explicit qualified publication. No release event should be interpreted as proof that a candidate reached npm.
- Repair public English examples to match real date/money, `*Schema` validation, UI, Drizzle, and Elysia APIs, and document security/runtime limitations without fixed test-count or audit promises.

### License scope

Current author-owned source is Apache-2.0; third-party dependencies retain their licenses. **Published versions 1.1.1 and earlier remain under their original PolyForm Noncommercial license.** This source-license change does not retroactively relicense historical artifacts.

## Historical releases — through 1.1.1

Historical npm artifacts and their original licenses remain unchanged. This changelog does not assign new dates, APIs, or license terms to those releases.
