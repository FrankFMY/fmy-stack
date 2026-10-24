# @frankfmy/core

ESM TypeScript utilities for dates, money, strings, Russian phone numbers and business identifiers, collections, functions, IDs, and password hashing.

[npm](https://www.npmjs.com/package/@frankfmy/core) · [Source](https://github.com/FrankFMY/fmy-stack/tree/main/packages/core) · [Issues](https://github.com/FrankFMY/fmy-stack/issues)

## Release status and installation

This README describes the **1.1.2 release candidate, pending publication**, not an already-published release. The npm page lists available versions. An unversioned install selects a published version:

```bash
bun add @frankfmy/core
```

The package publishes ESM JavaScript and TypeScript declarations, not CommonJS. Use Node.js with Web Crypto support (Node 20+), Bun, or a browser bundler. Cryptographic helpers require `globalThis.crypto`, including `crypto.subtle`. Legacy bcrypt verification uses the declared `bcryptjs` runtime dependency in Node and Bun.

All APIs below are available from the root. Focused entry points: `/dates`, `/money`, `/strings`, `/phone`, `/business`, `/crypto`, `/arrays`, `/functions`, and `/types`.

## Dates

```typescript
import {
  formatDateRU, formatDateShort, formatDateISO,
  formatDateTimeRU, formatRelativeTime, isBusinessDay
} from '@frankfmy/core';

// A local calendar date avoids an implicit UTC-to-local date conversion.
const date = new Date(2026, 9, 24, 14, 30);
formatDateRU(date);       // '24 октября 2026'
formatDateShort(date);    // '24.10.2026'
formatDateISO(date);      // '2026-10-24'
formatDateTimeRU(date);   // '24 октября 2026, 14:30'
formatRelativeTime(new Date(Date.now() - 3_600_000)); // '1 час назад'
isBusinessDay(date);      // false (Saturday)
```

Formatting functions take one `Date | string | number` argument: **no format-pattern or locale-options argument**. They use the runtime's local timezone, not Moscow time or UTC. `formatDateISO` returns a local calendar date, not a full ISO timestamp.

| API | Behavior |
| --- | --- |
| `addDays(date, n)`, `addMonths(date, n)`, `addYears(date, n)` | Return a new Date using native local-calendar setters; month-end rollover follows JavaScript Date behavior |
| `diffDays(a, b)`, `diffHours(a, b)` | Floor the absolute elapsed-time difference, not signed calendar differences |
| `startOfDay`, `endOfDay`, `startOfMonth`, `endOfMonth` | Return a new Date at a local boundary |
| `isWeekend`, `isBusinessDay` | Saturday/Sunday versus Monday–Friday; no public-holiday calendar |
| `getBusinessDaysCount(start, end)` | Counts weekdays inclusively; zero for a reversed range |
| `getMonthNameRU(month)`, `getMonthNameRUNominative(month)` | Zero-based month index; genitive or nominative Russian name |
| `getWeekdayNameRU(date)`, `getWeekdayNameRUShort(date)` | Full or abbreviated Russian weekday name |
| `formatDuration(ms)` | Compact Russian duration string |
| `isValidDate(value)` | Checks for a valid Date object, not string inputs |
| `getMoscowTime()` | Re-parses Moscow wall-clock text into a local Date; not a timezone-aware instant |

Validate inputs yourself. For timezone-sensitive scheduling, prefer explicit timezone-aware formatting rather than treating `getMoscowTime()` as a preserved instant. `formatRelativeTime` describes past time; future dates currently return `'только что'`.

## Money

```typescript
import {
  Currency, VATRate, formatMoneyRU, formatMoney,
  calcVAT, addVAT, calcDiscount, parseMoney
} from '@frankfmy/core';

formatMoneyRU(1234.56);             // '1 234,56 ₽'
formatMoney(1234.56, Currency.USD); // '1 234.56 $'
calcVAT(120, VATRate.STANDARD);     // { net: 100, vat: 20, gross: 120 }
addVAT(100, 20);                    // { net: 100, vat: 20, gross: 120 }
calcDiscount(100, 15);              // { original: 100, discount: 15, final: 85 }
parseMoney('1 234,56 ₽');           // 1234.56
```

- `formatMoneyRU(amount)` always uses RUB and a decimal comma. It has no currency or locale parameters.
- `formatMoney(amount, currency = 'RUB')` uses two decimals and a currency-symbol suffix, not locale-sensitive `Intl` formatting. Supported `Currency` values: `RUB`, `USD`, `EUR`, `GBP`, `CNY`.
- `calcVAT(gross, rate = 20)` **extracts included VAT**; `addVAT(net, rate = 20)` adds it. Both return `{ net, vat, gross }`; neither accepts an inclusive/exclusive boolean.
- `VATRate` exposes `STANDARD: 20`, `REDUCED: 10`, `ZERO: 0`: convenience constants, not a jurisdiction/date-aware tax rules engine.
- `formatMoneyShort(amount, currency?)` uses `K`, `M`, and `B` suffixes. `roundMoney(amount)` rounds to two decimals. `calcDiscountPercent(originalPrice, finalPrice)` returns a rounded whole-number percentage.
- `formatCreditCard(number)` masks all but the last four digits. `formatCreditCardFull(number)` groups all digits without masking; do not use it for logs or sensitive displays.
- `validateIBAN(iban)` checks general format and mod-97, not account existence.

These are floating-point helpers, not decimal accounting primitives. Validate finite values and allowed rates. `parseMoney()` is permissive: it removes currency and other nonnumeric characters, removes minus signs, and returns zero on parse failure. Do not use it as a strict financial-input validator.

## Strings

```typescript
import { pluralize, slugify, truncate, maskEmail, maskPhoneNumber } from '@frankfmy/core';

pluralize(1, ['товар', 'товара', 'товаров']); // 'товар'
pluralize(3, ['товар', 'товара', 'товаров']); // 'товара'
pluralize(5, ['товар', 'товара', 'товаров']); // 'товаров'
slugify('Привет Мир!');                    // 'privet-mir'
truncate('Long text...', 10);              // 'Long te...'
maskEmail('user@example.com');            // 'u***@example.com'
maskPhoneNumber('+79161234567');          // '+7 (***) ***-45-67'
```

There is no `maskString` export. Use `maskEmail`, `maskPhone`, or `maskPhoneNumber` for their specific formats. `maskPhone` leaves the last **seven** digits visible, while `maskPhoneNumber` leaves four.

Other exports: `pluralizeWithNumber`, `capitalize`, `titleCase`, `transliterate`, `normalizeSpaces`, `wordCount`, `isAlpha`, `isAlphanumeric`, `formatNumber`, `formatPercent`, `stripHtml`, `escapeHtml`, `unescapeHtml`, `highlightText`, `extractEmails`, `extractUrls`, and `randomString`.

`randomString` uses `Math.random()` and is **not for secrets**. `stripHtml` is a regex text helper, not an HTML sanitizer. `highlightText` returns HTML without escaping input or validating the tag; do not render untrusted input as trusted HTML. `formatPercent(0.15)` formats a fraction, whereas validation's `PercentSchema` accepts numbers from 0 to 100.

## Phone numbers

```typescript
import { cleanPhone, formatPhoneRU, validatePhoneRU, createPhoneLink } from '@frankfmy/core';

cleanPhone('8 (916) 123-45-67');  // '+79161234567'
formatPhoneRU('79161234567');    // '+7 (916) 123-45-67'
validatePhoneRU('+79161234567'); // true
validatePhoneRU('+74951234567'); // false (not a mobile number)
createPhoneLink('9161234567');   // 'tel:+79161234567'
```

`cleanPhone()` returns a leading `+`, not digits alone. It normalizes ten digits or eleven digits beginning with 8 to +7; it is not itself a validator. `validatePhoneRU()` recognizes mobile-number patterns, not landlines or proof of ownership.

Additional exports: `formatPhoneCompact`, `parsePhone`, `getOperator`, `createWhatsAppLink`, `createTelegramLink`, and `maskPhoneNumber`. `parsePhone()` has a more permissive structural check than `validatePhoneRU()`. `getOperator()` is a static prefix lookup without number-portability data.

## Russian business identifiers

```typescript
import { validateINN, validateOGRN, validateKPP, validateSNILS } from '@frankfmy/core';

validateINN('7707083893');     // true: organization INN
validateINN('500100732259');   // true: individual INN
validateOGRN('1027700132195'); // true
validateKPP('770701001');      // true
validateSNILS('11223344595');  // true
```

Also exported: `validateBIK`, `validateAccount(account, bik)`, `formatINN`, `formatOGRN`, `formatKPP`, `formatSNILS`, `generateINN10`, `generateINN12`, `getINNType`, and `getOGRNType`.

These helpers check structure and, where implemented, checksums. They strip nondigit characters and do not query registries, identify an owner, or prove legal status. Generated INNs are synthetic test data, not issued identifiers.

## Password hashing and migration

```typescript
import { hashPassword, verifyPassword, passwordHashNeedsRehash } from '@frankfmy/core';

const password = 'Example-Passphrase-2026!';
const storedHash = await hashPassword(password);
const valid = await verifyPassword(password, storedHash);
if (!valid) throw new Error('Credential verification failed');
const needsMigration = passwordHashNeedsRehash(storedHash); // false for a new hash
```

New hashes use Web Crypto **PBKDF2-SHA256 with 600,000 iterations**, a random salt, and a 32-byte derived key. Storage format: `$pbkdf2-sha256$600000$<salt-hex>$<derived-key-hex>`.

`verifyPassword(password, hash)` supports that format, legacy `$sha256$<salt>$<hash>` records, and bcrypt `$2a$`, `$2b$`, and `$2y$` records via `bcryptjs` in Node and Bun. Additional formats may be verified by Bun's password API when present; they are not a cross-runtime promise. New hashes never depend on Bun's native format.

**Migration belongs to the credential owner.** Call `passwordHashNeedsRehash()` only after successful verification. It checks format/work factor, not password correctness. Persist a replacement with a credential compare-and-swap so a concurrent password change cannot be overwritten:

```typescript
import { hashPassword, verifyPassword, passwordHashNeedsRehash } from '@frankfmy/core';

// Implement this callback atomically in the caller's credential store.
// Return false when the stored credential no longer equals expectedHash.
type ReplaceCredential = (expectedHash: string, replacementHash: string) => Promise<boolean>;

async function verifyAndUpgrade(
  password: string,
  storedHash: string,
  replaceIfUnchanged: ReplaceCredential
): Promise<boolean> {
  if (!await verifyPassword(password, storedHash)) return false;
  if (/^\$2[aby]\$/.test(storedHash) && new TextEncoder().encode(password).length > 72) {
    return false; // Use the application's reset policy for ambiguous legacy input.
  }
  if (passwordHashNeedsRehash(storedHash)) {
    const replacement = await hashPassword(password);
    if (!await replaceIfUnchanged(storedHash, replacement)) {
      return false; // Reload/reverify instead of accepting stale credentials.
    }
  }
  return true;
}
```

Never log passwords or credential hashes. Legacy SHA-256 password hashes are fast and should be migrated. Legacy bcrypt truncates after **72 UTF-8 bytes**, so different long inputs can verify against one stored credential. Do not silently treat such input as an unambiguous password during migration; define a recovery/reset policy for affected accounts.

Passwords and stored hashes are capped at 4,096 JavaScript code units; oversized hashing input throws and verification returns false. This is **not a comprehensive resource budget**: bcrypt's encoded cost is not capped by this API, and the input bound does not remove bcrypt's 72-byte truncation behavior. Restrict trusted stored formats/work factors, bound request sizes, and rate-limit authentication. PBKDF2 records accept verification work factors from 100,000 to 1,000,000 and are marked for rehash unless they match the current format.

## IDs, tokens, and encodings

```typescript
import { generateUUID, generateNanoid, generateToken, generateOTP } from '@frankfmy/core';

generateUUID();    // Random UUID v4
generateNanoid();  // URL-friendly ID; default length 21
generateToken(32); // 32 random bytes encoded as 64 hexadecimal characters
generateOTP(6);    // Six cryptographically generated decimal digits
```

Also exported: `generateSecureRandom(min, max)` (inclusive integer bounds), `hashSHA256`, `hashSHA512`, `generateApiKey`, `generateRandomPassword`, `checkPasswordStrength`, `secureCompare`, `encodeBase64`, `decodeBase64`, `encodeBase64Url`, and `decodeBase64Url`.

- `generateToken(length = 32)` takes a **byte count**, not a nanoid length. `generateApiKey()` prefixes a 24-byte hexadecimal token with `fmy_`.
- `generateOTP` accepts integer lengths 1–128; `generateRandomPassword` accepts 4–1024 and includes lowercase, uppercase, a number, and a special character. Neither stores, expires, or enforces one-time use of generated values.
- `generateSecureRandom` requires safe integer bounds and a range no larger than 2^32; it uses rejection sampling. Validate user-controlled sizes before calling other generators.
- General digests are not password-storage replacements. `checkPasswordStrength` is a heuristic, not a breached-password check.
- `secureCompare` returns early for unequal lengths and uses a JavaScript XOR loop otherwise; it is not a platform-level constant-time guarantee.
- The browser Base64 fallback uses `btoa` / `atob`; unlike Node's Buffer path it does not transparently encode/decode arbitrary Unicode as UTF-8. Base64 is encoding, not encryption.

## Collections and functions

```typescript
import { groupBy, chunk, debounce, throttle } from '@frankfmy/core';

const users = [
  { id: 1, role: 'admin' },
  { id: 2, role: 'user' },
  { id: 3, role: 'admin' }
];
const byRole = groupBy(users, 'role');
const batches = chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
const debouncedSearch = debounce(() => console.log('Search requested'), 300);
const throttledScroll = throttle(() => console.log('Scroll handled'), 100);
```

Collection exports: `unique`, `uniqueBy`, `shuffle`, `groupBy`, `groupByFn`, `sortBy`, `chunk`, `flatten`, `flattenDeep`, `difference`, `intersection`, `union`, `first`, `last`, `sample`, `sampleN`, `countBy`, `sum`, `average`, `median`, `min`, `max`, `minBy`, `maxBy`, `keyBy`, `range`, `isEmpty`, `isNotEmpty`, `compact`, `zip`, and `partition`. Use positive chunk sizes and bounded collection/range sizes; these are not untrusted-input validators.

Function exports: `debounce`, `debounceImmediate`, `throttle`, `throttleWithTrailing`, `memoize`, `once`, `noop`, `identity`, `compose`, `pipe`, `sleep`, and `retry`. Timed wrappers return no result and expose no cancellation method. `memoize` keys by `JSON.stringify(args)` and has an unbounded cache. `retry(fn, maxRetries = 3, delay = 1000)` uses the second argument as the **total attempt count** and linear delays; supply a positive integer and make retried effects safe.

## Shared types and result values

```typescript
import { Ok, Err, UserRole, type Result, type ApiResponse } from '@frankfmy/core';

function lookup(found: boolean): Result<{ id: string }, string> {
  return found ? Ok({ id: '1' }) : Err('Not found');
}

const result = lookup(true);
if (result.success) console.log(result.data.id); // Success uses data, not value.
const response: ApiResponse<{ role: string }> = {
  success: true,
  data: { role: UserRole.USER }
};
```

`Result<T, E = Error>` discriminates `{ success: true, data: T }` and `{ success: false, error: E }`. `ApiResponse<T>` has optional `data`, structured `error: { code, message, details? }`, and `meta`, not `statusCode`. The Elysia package has a separate response contract.

Other exports: `ApiError`, `ApiMeta`, `PaginatedResponse`, `EntityStatus`, `Nullable`, `Optional`, `Maybe`, `DeepPartial`, `DeepReadonly`, `KeysOfType`, `OmitMultiple`, `VoidFunction`, `AsyncFunction`, and `Callback`. `UserRole` and `EntityStatus` are runtime constants and inferred types.

## Author and license

By [Artem Prianishnikov](https://github.com/FrankFMY/fmy-stack#author).

Current author-owned source is Apache-2.0; see [LICENSE](LICENSE) and [NOTICE](NOTICE). Published versions **1.1.1 and earlier remain under their original PolyForm Noncommercial license**. This does not retroactively relicense those artifacts or third-party dependencies.
