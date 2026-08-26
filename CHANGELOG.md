# Changelog

## 1.1.2 — 2026-08-26

### Security and correctness

- Replaced new password hashes with cross-runtime PBKDF2-SHA256 at 600,000 iterations.
- Added explicit legacy-hash migration detection and verified legacy SHA-256 hashes before Bun-specific handlers.
- Bounded password/hash inputs and generated OTP/password lengths before expensive allocation or loops.
- Removed modulo bias from bounded cryptographic random integers and added strict range validation.
- Raised the Drizzle peer floor to the first release patched for CVE-2026-39356 and added malicious-identifier SQL regression coverage.
- Validated bulk chunk sizes and mapped TypeScript keys to physical PostgreSQL column names in upserts.
- Made rate limiting ignore spoofable proxy headers by default, bounded its in-memory buckets, removed background timer ownership, and added explicit trusted-proxy opt-in.
- Preserved independently configured rate-limit plugins and propagated auth/JWT derived context types through Elysia scoped plugins.
- Shipped the previously missing `@frankfmy/ui/styles.css` Tailwind v4 source-registration export.

### Packaging

- Versioned all five workspace packages at 1.1.2 under Apache-2.0.
- Added LICENSE and NOTICE to every package tarball.
- Removed workspace protocols and unused internal runtime dependencies from published manifests.
- Externalized framework dependencies from db-utils and elysia-kit bundles.
- Excluded tests from declaration/package output.
- Added coordinated clean-tarball install/import, package-export, `npm ls`, and production-audit gates.
- Made package verifiers create isolated npm roots, reject leaked test trees, and read the installed UI root export instead of resolving it only.
- Added release-only npm Trusted Publishing with provenance.

## 1.1.1 — 2025-12-03

- Previous npm registry release.
