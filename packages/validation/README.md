# @frankfmy/validation

ArkType runtime schemas and inferred TypeScript types for common identity, account, money, business, and pagination contracts.

[npm](https://www.npmjs.com/package/@frankfmy/validation) · [Source](https://github.com/FrankFMY/fmy-stack/tree/main/packages/validation) · [Issues](https://github.com/FrankFMY/fmy-stack/issues)

## Release status and installation

This README documents the **1.1.2 API contract**. Check npm for available published versions and use a matching package version; unversioned installation follows the registry's current dist-tag:

```bash
bun add @frankfmy/validation
```

The package is ESM with TypeScript declarations and declares ArkType 2 and `@frankfmy/core` as runtime dependencies. It re-exports ArkType's `type` (also as `t`) and `scope`, so the examples do not need a separate direct ArkType install. If your application imports `arktype` itself, declare it as a direct dependency.

## Runtime values versus types

**Call names ending in `Schema` for runtime validation.** Short names such as `Email`, `INN`, `PasswordStrong`, and `UserCreate` are type-only exports; importing them as functions will not work. Capitalization is `UrlSchema` and `UuidSchema`, not `URL` or `UUID`.

```typescript
import { EmailSchema, type, type Email } from '@frankfmy/validation';

const result = EmailSchema('user@example.com');
if (result instanceof type.errors) {
  console.error(result.summary);
} else {
  const email: Email = result;
  console.log(email);
}
```

Calling a schema returns validated data or an ArkType `type.errors` collection. **Do not test `instanceof Error`** for this result. For applications that prefer a discriminated union or exceptions, use the exported wrappers:

```typescript
import { EmailSchema, validate, validateOrThrow } from '@frankfmy/validation';

const result = validate(EmailSchema, 'not-an-email');
if (!result.success) console.error(result.errors); // string[]
else console.log(result.data);

const email = validateOrThrow(EmailSchema, 'user@example.com');
// Throws an ordinary Error with a validation summary on invalid input.
```

Do not log entire validation inputs or password-related error summaries in production; error text may contain submitted values. Responses for domain-specific refinements currently contain Russian messages, even though this documentation is English.

## Basic schemas and string factories

```typescript
import {
  UrlSchema, UuidSchema, NonEmptyStringSchema,
  minLengthString, maxLengthString, rangeLengthString
} from '@frankfmy/validation';

UrlSchema('https://example.com');
UuidSchema('550e8400-e29b-41d4-a716-446655440000');
NonEmptyStringSchema('Hello');
minLengthString(3)('abc');
maxLengthString(5)('hello');
rangeLengthString(3, 10)('example');
```

`EmailSchema` validates an email string, `UrlSchema` a URL string, and `UuidSchema` specifically a UUID **v4**. String length constraints are inclusive. `NonEmptyStringSchema` requires length at least one, not non-whitespace text: it does not trim. Pass valid numeric bounds to the factories; they build ArkType constraints rather than sanitize configuration.

## Russian identifiers

```typescript
import {
  PhoneRUSchema, INNSchema, OGRNSchema, SNILSSchema, PassportRUSchema
} from '@frankfmy/validation';

PhoneRUSchema('+79161234567');
INNSchema('7707083893');       // Organization: 10 digits
INNSchema('500100732259');     // Individual: 12 digits
OGRNSchema('1027700132195');
SNILSSchema('11223344595');
PassportRUSchema('4510 123456'); // A string, not an object of passport fields
```

| Runtime schema | Check |
| --- | --- |
| `PhoneRUSchema` | Russian mobile-number pattern; landlines are rejected |
| `INN10Schema`, `INN12Schema`, `INNSchema` | Organization, individual, or either INN length plus checksum |
| `OGRN13Schema`, `OGRN15Schema`, `OGRNSchema` | Organization OGRN, entrepreneur OGRNIP, or either length plus checksum |
| `KPPSchema` | Nine-digit KPP structure |
| `SNILSSchema` | SNILS structure/checksum |
| `BIKSchema` | Nine digits beginning with 04 |
| `PassportRUSchema` | Ten digits after removing nondigit characters; no issuance or ownership check |

These refinements remove nondigit characters **for checking only**, then return the original string. They do not normalize stored values or query official registries. Normalize separately if your storage contract requires it. There are matching type-only exports (`PhoneRU`, `INN10`, `INN12`, `INN`, `OGRN13`, `OGRN15`, `OGRN`, `KPP`, `SNILS`, `BIK`, `PassportRU`).

## Passwords and usernames

```typescript
import { PasswordStrongSchema, PasswordSimpleSchema, UsernameSchema } from '@frankfmy/validation';

PasswordStrongSchema('Example-Passphrase-2026!');
PasswordSimpleSchema('atleast6');
UsernameSchema('example_user');
```

- `PasswordStrongSchema`: at least eight characters, an ASCII uppercase letter, ASCII lowercase letter, digit, and one of the special characters recognized by its punctuation regex. It does not impose a maximum length or check breached passwords.
- `PasswordSimpleSchema`: at least six characters only. It is not equivalent to the strong policy.
- `UsernameSchema`: 2–50 characters from ASCII letters, digits, and underscore.

Validation is not hashing. Apply an application-specific maximum password/input size before expensive processing, and use a password KDF such as core's `hashPassword` for storage. Never log passwords.

## Money and numbers

```typescript
import {
  MoneySchema, PositiveMoneySchema, PercentSchema,
  TenderBudgetSchema, RatingSchema, PositiveIntSchema, NonNegativeIntSchema
} from '@frankfmy/validation';

MoneySchema(1234.56);
PositiveMoneySchema(1);
PercentSchema(75.5);
TenderBudgetSchema(1_000_000);
RatingSchema(4.5);
PositiveIntSchema(1);
NonNegativeIntSchema(0);
```

| Schema | Accepted numeric range |
| --- | --- |
| `MoneySchema` | At least 0 |
| `PositiveMoneySchema` | Greater than 0 |
| `PercentSchema` | 0–100, inclusive |
| `TenderBudgetSchema` | At least 10,000 |
| `RatingSchema` | 1–5, inclusive; fractions are allowed |
| `PositiveIntSchema` | Integer greater than 0 |
| `NonNegativeIntSchema` | Integer at least 0 |

These schemas do not coerce numeric strings or enforce currency precision. Add explicit finite-number and business upper bounds when required by your application. Matching short names are inferred types, not validators.

## Account and form schemas

```typescript
import { UserCreateSchema, validate, type UserCreate } from '@frankfmy/validation';

const result = validate(UserCreateSchema, {
  email: 'user@example.com',
  name: 'Иван Иванов',
  phone: '+79161234567', // Optional
  password: 'Example-Passphrase-2026!'
});

if (result.success) {
  const user: UserCreate = result.data;
  // Pass user to application-owned registration logic; do not log its password.
}
```

`UserCreateSchema` requires **`name`**, not `firstName`, `lastName`, or `middleName`. It does not create a user, check uniqueness, or hash a password.

| Schema | Fields |
| --- | --- |
| `UserCreateSchema` | Required `email`, `name` (2–100 characters), strong `password`; optional `phone` |
| `UserLoginSchema` | Required email and nonempty password |
| `UserUpdateSchema` | Optional `name` (2–100), `phone`, URL `avatar`; an empty object is valid |
| `ChangePasswordSchema` | Nonempty `currentPassword`, strong `newPassword`, and matching `confirmPassword` |
| `ResetPasswordSchema` | Nonempty `token`, strong `newPassword`, and matching `confirmPassword` |

Password-change schemas compare confirmation values only. They do not verify the current credential, validate a reset token against a store, or enforce token expiry or single use. Unknown object properties are not rejected by an explicit strict-object policy here; do not assume this is a field-stripping boundary.

## Business objects

| Schema | Fields |
| --- | --- |
| `LegalEntitySchema` | Required `name` (1–500), `inn` (INN10), `ogrn` (OGRN13); optional `kpp`, `address` (1–500) |
| `IndividualEntrepreneurSchema` | Required `name` (1–500), `inn` (INN12), `ogrnip` (OGRN15); optional `address` (1–500) |
| `BankDetailsSchema` | Required nonempty `bankName`, valid `bik`, string `accountNumber`, string `corrAccount` |

`BankDetailsSchema` does **not** enforce a 20-digit account length or validate the account/BIK checksum. Add those checks yourself, for example with `validateAccount` from `@frankfmy/core`. The object schemas have matching inferred type exports without `Schema`.

## Pagination and search

```typescript
import { PaginationSchema, SearchParamsSchema } from '@frankfmy/validation';

PaginationSchema({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' });
SearchParamsSchema({ query: 'example', page: 1, limit: 20 });
```

All fields are optional. `page` and `limit` must be integers at least one; there are no inserted defaults or upper limits. `sortOrder` is `'asc' | 'desc'`. `sortBy` is an arbitrary string, **not an approved SQL identifier**: map it through an application-owned allowlist before building queries. URL query strings must be converted and bounded explicitly rather than passed as numeric strings.

## Composition and scope

```typescript
import { type, INNSchema, PhoneRUSchema, v } from '@frankfmy/validation';

const CompanyData = type({
  name: 'string >= 3',
  inn: INNSchema,
  email: 'string.email',
  phone: PhoneRUSchema
});
const result = CompanyData({
  name: 'Example company', inn: '7707083893',
  email: 'contact@example.com', phone: '+79161234567'
});

v.email('user@example.com');
v.money(123.45);
```

Use ArkType 2's `.narrow((value, ctx) => condition || ctx.mustBe('...'))` for custom refinements, not an unsupported `validator` options object. The exported `validationScope` and its runtime export `v` contain `email`, `url`, `uuid`, `money`, `positiveInt`, `nonEmptyString`, and `passwordSimple`; they are not a scope containing every schema in this package.

## Explicit validation in Elysia

This example uses Elysia's basic body schema first, then ArkType for the domain contract. It returns only a placeholder acceptance response, not an account or authentication implementation:

```typescript
import { Elysia, t } from 'elysia';
import { UserCreateSchema, validate } from '@frankfmy/validation';

const app = new Elysia().post('/register', ({ body, set }) => {
  const result = validate(UserCreateSchema, body);
  if (!result.success) {
    set.status = 400;
    return { accepted: false }; // Avoid echoing password-containing validation details.
  }
  return { accepted: true, name: result.data.name };
}, {
  body: t.Object({
    email: t.String(), name: t.String(), password: t.String(),
    phone: t.Optional(t.String())
  })
});
```

Install `elysia` separately if using this integration. The validation package itself has no Elysia dependency.

## Author and license

By [Artem Prianishnikov](https://github.com/FrankFMY/fmy-stack#author).

Current author-owned source is Apache-2.0; see [LICENSE](LICENSE) and [NOTICE](NOTICE). Published versions **1.1.1 and earlier remain under their original PolyForm Noncommercial license**. This does not retroactively relicense those artifacts or third-party dependencies.
