# @frankfmy/db-utils

Drizzle ORM helpers for PostgreSQL schemas, pagination, search, soft deletion, transactions, bulk operations, and development seeding.

[npm](https://www.npmjs.com/package/@frankfmy/db-utils) · [Source](https://github.com/FrankFMY/fmy-stack/tree/main/packages/db-utils) · [Issues](https://github.com/FrankFMY/fmy-stack/issues)

## Release status and compatibility

This README documents the **2.0.0 API contract**. Check the npm page for available published versions and use the matching package version with these APIs.

Version 2.0.0 requires **`drizzle-orm >=0.45.2 <1` as an external peer dependency**. Drizzle is not bundled: install a compatible version in your application, together with your chosen PostgreSQL driver. Raising the previous `>=0.30.0` peer range is a **breaking compatibility change**, which is why this change uses 2.0.0 rather than a patch release. Upgrade and validate your application's Drizzle queries and migrations before adopting it.

These APIs use PostgreSQL columns, query builders, and SQL features. This README does not claim SQLite or MySQL compatibility. The package does not create a connection, install PostgreSQL extensions, or run migrations for you.

## Installation

Install a published package and a compatible Drizzle peer:

```bash
bun add @frankfmy/db-utils 'drizzle-orm@>=0.45.2 <1'
```

Unversioned installation follows the registry's current dist-tag; select the matching published version for these APIs. Configure your driver and export your Drizzle connection as `db` from `./db` in the examples below.

These examples assume a connection using Drizzle's default empty relational-schema generic (for example, `drizzle(client)`), with table objects supplied directly to query builders. Current transaction, bulk, and seeder signatures accept `PgDatabase<any>` with that default schema generic; a connection created with a registered relational schema can fail TypeScript assignability checks. Do not cast away that incompatibility without reviewing the integration; broader registered-schema typing is not part of the qualified contract in version 2.0.0.

## Schema helpers

The examples use this application-owned `schema.ts`:

```typescript
import { customType, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';
import { baseEntityColumns, softDeleteColumns } from '@frankfmy/db-utils';

const tsvector = customType<{ data: string }>({
  dataType() { return 'tsvector'; }
});

export const users = pgTable('users', {
  ...baseEntityColumns,
  ...softDeleteColumns,
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  searchVector: tsvector('search_vector')
});

export const profiles = pgTable('profiles', {
  userId: uuid('user_id').primaryKey().references(() => users.id),
  bio: text('bio').notNull()
});
```

- `baseEntityColumns`: UUID primary key `id` with SQL default `gen_random_uuid()`, plus non-null timezone-aware `createdAt` and `updatedAt` timestamps with `defaultNow()`.
- `timestampColumns`: the same timestamps without an ID, for tables that define their own key.
- `softDeleteColumns`: nullable `deletedAt` and non-null `isDeleted` with default `false`.
- `updatedAt` uses Drizzle's `$onUpdate(() => new Date())`. This is an ORM update hook, **not a database trigger**; raw SQL writes do not automatically run it.
- `BaseEntity`, `Timestamps`, and `SoftDeletable` are exported TypeScript interfaces, not runtime validators.

Ensure your PostgreSQL server provides `gen_random_uuid()`. The example only declares the `tsvector` column: populate and maintain it through your own application logic or database migration, and add indexes appropriate for your workload.

## Pagination

```typescript
import { count } from 'drizzle-orm';
import { paginate, buildPaginatedResult } from '@frankfmy/db-utils';
import { db } from './db';
import { users } from './schema';

const params = { page: 1, limit: 20 };
const [data, totals] = await Promise.all([
  paginate(db.select().from(users).orderBy(users.id).$dynamic(), params),
  db.select({ total: count() }).from(users)
]);

const result = await buildPaginatedResult(data, totals[0]?.total ?? 0, params);
// result.data contains this page's rows.
// result.meta: page, limit, total, totalPages, hasNext, hasPrev.
```

`paginate(query, params?)` adds `LIMIT` and `OFFSET` and returns the query builder; await it to fetch rows. Use a PostgreSQL dynamic query builder when composing helpers. Supply a stable `orderBy` for predictable page boundaries. `buildPaginatedResult(data, total, params?)` is asynchronous and returns `Promise<PaginatedResult<T>>`; it does not execute a count query.

`PaginationParams` defaults to `page: 1`, `limit: 20`, `maxLimit: 100`. The helpers clamp the page to at least 1 and the limit between 1 and `maxLimit`; they do not validate finite integer inputs or clamp the page to `totalPages`. Validate request inputs and use a positive integer `maxLimit` before calling them. Apply identical filters to the data and count queries. Separate concurrent reads are not necessarily a consistent database snapshot.

`getCountSql(table)` returns `SELECT COUNT(*) as count FROM ...` as a Drizzle SQL object. Execute it with `db.execute()`; the result shape depends on your driver, and PostgreSQL counts may require conversion to a number. Use Drizzle's `count()` selection above for a typed query-builder example. The `PaginatedResult<T>` type is also exported.

## Search

```typescript
import {
  buildSearchFilter, buildFullTextSearch, buildTrigramSearch
} from '@frankfmy/db-utils';
import { db } from './db';
import { users } from './schema';

const nameOrEmail = buildSearchFilter({
  query: 'john',
  columns: [users.name, users.email],
  mode: 'contains'
});
const matches = await db.select().from(users).where(nameOrEmail);

const fullTextMatches = await db.select().from(users).where(
  buildFullTextSearch(users.searchVector, 'поиск', 'russian')
);
const fuzzyMatches = await db.select().from(users).where(
  buildTrigramSearch(users.name, 'jonh', 0.3)
);
```

- `buildSearchFilter(config: SearchConfig)` ORs case-insensitive `ILIKE` conditions. Modes are `contains` (default), `startsWith`, `endsWith`, and `exact`. It trims the query and returns `undefined` for blank queries or no columns. `%` and `_` in input remain SQL LIKE wildcards, including in `exact` mode; this is not literal-equality matching.
- `buildFullTextSearch(column, query, language = 'russian')` produces `column @@ plainto_tsquery(...)`. It requires a populated PostgreSQL `tsvector` column and an installed text-search configuration. It does not create the vector or index.
- `buildTrigramSearch(column, query, threshold = 0.3)` produces `similarity(column, query) > threshold`. It requires the PostgreSQL `pg_trgm` extension. Validate the threshold in your application; the helper does not enforce the documented 0–1 range.

## Soft deletion

```typescript
import { eq } from 'drizzle-orm';
import {
  withSoftDelete, onlyDeleted, getSoftDeleteValues, getRestoreValues
} from '@frankfmy/db-utils';
import { db } from './db';
import { users } from './schema';

const options = {
  deletedAtColumn: users.deletedAt,
  isDeletedColumn: users.isDeleted
};
const activeUsers = await db.select().from(users).where(withSoftDelete(options));
const deletedUsers = await db.select().from(users).where(onlyDeleted(options));

async function softDeleteUser(userId: string) {
  await db.update(users).set(getSoftDeleteValues()).where(eq(users.id, userId));
}
async function restoreUser(userId: string) {
  await db.update(users).set(getRestoreValues()).where(eq(users.id, userId));
}
```

`SoftDeleteOptions` requires `deletedAtColumn` and optionally accepts `isDeletedColumn`. With both columns, `withSoftDelete()` requires a null timestamp **and** a false flag; `onlyDeleted()` checks the true flag. Without the flag column, they check whether the timestamp is null or non-null respectively.

`getSoftDeleteValues()` returns `{ deletedAt: new Date(), isDeleted: true }`; `getRestoreValues()` returns `{ deletedAt: null, isDeleted: false }`. Both require these property names in your schema. No filter is applied automatically: explicitly use these helpers in every query that must exclude deleted rows.

## Transactions

```typescript
import {
  runTransaction, runBatchTransaction, runTransactionWithRetry
} from '@frankfmy/db-utils';
import { db } from './db';
import { users, profiles } from './schema';

const createdUser = await runTransaction(db, async (tx) => {
  const [user] = await tx.insert(users)
    .values({ email: 'new@example.com', name: 'New user' }).returning();
  if (!user) throw new Error('Insert returned no user');
  await tx.insert(profiles).values({ userId: user.id, bio: 'Hello' });
  return user;
});

await runBatchTransaction(db, [
  async (tx) => tx.insert(users).values({ email: 'one@example.com', name: 'One' }),
  async (tx) => tx.insert(users).values({ email: 'two@example.com', name: 'Two' })
]);

const retriedUser = await runTransactionWithRetry(db, async (tx) => {
  const [user] = await tx.insert(users)
    .values({ email: 'retry@example.com', name: 'Retry example' }).returning();
  return user;
}, 3, 100);
```

`runTransaction()` delegates commit and rollback to Drizzle and returns the callback result. `runBatchTransaction()` executes callbacks sequentially in one transaction and returns their results. `TransactionCallback<TDb, TResult>` is exported for callback typing.

Despite its name, `maxRetries` in `runTransactionWithRetry(db, callback, maxRetries = 3, retryDelay = 100)` is the **total attempt count**, including the initial attempt. Use a positive integer. Retry detection is based on case-sensitive `Error.message` substrings: `deadlock`, `serialization`, or `could not serialize`; it is not SQLSTATE-based. Delays grow linearly (`retryDelay * attemptNumber`), not exponentially. The entire callback can run again: keep non-transactional effects such as email, HTTP calls, and queue publication outside it or make them safely idempotent.

## Bulk operations

```typescript
import { bulkInsert, bulkUpdate, bulkUpsert } from '@frankfmy/db-utils';
import { db } from './db';
import { users } from './schema';

const inserted = await bulkInsert(db, users, [
  { email: 'user1@example.com', name: 'One' },
  { email: 'user2@example.com', name: 'Two' }
], { chunkSize: 1000, skipDuplicates: true });

const processed = await bulkUpsert(db, users, [
  { email: 'user1@example.com', name: 'Updated name' }
], 'email', ['name'], { chunkSize: 1000 });

async function renameUser(userId: string) {
  return bulkUpdate(db, 'users', [
    { id: userId, name: 'Renamed user' }
  ], { chunkSize: 500 });
}
```

- `bulkInsert()` returns a numeric count, not rows. `skipDuplicates` defaults to `false`; when true it uses `ON CONFLICT DO NOTHING`.
- `bulkUpsert()` accepts a single conflict-target **schema property key** and an array of update property keys. The target must have an appropriate unique constraint. Update expressions use the corresponding SQL column names from the schema. It returns a numeric processed-row count, not rows.
- `bulkUpdate()` accepts a **SQL table-name string**, not a Drizzle table. Each record needs a string `id`; other keys must be actual SQL column names, not camelCase schema properties when those differ. Identifiers are quoted and values are parameterized. Each nonempty update executes separately, with one transaction per chunk. Its count tracks executed updates, not necessarily rows matched. Raw SQL does not run Drizzle's `updatedAt` hook.
- `BulkOptions.chunkSize` defaults to 1000 for insert/upsert and 500 for update. It must be a safe integer from 1 to 100000. `skipDuplicates` only affects `bulkInsert()`.
- Insert/upsert counts use the driver's `rowCount` where implemented and otherwise fall back to chunk length. With skipped duplicates and no `rowCount`, this fallback can overstate inserted rows.
- Chunks are processed sequentially. Insert/upsert do not wrap the entire operation in a transaction; update commits each chunk separately. An error can therefore leave earlier chunks committed. Use an explicitly designed enclosing transaction if you need all-or-nothing behavior.

## Database seeding

Use seeding only against databases you intend to modify. `truncate: true` and `reset()` issue **`TRUNCATE ... CASCADE`**, which can remove rows in dependent tables.

```typescript
import { createSeeder, fakeData } from '@frankfmy/db-utils';
import { db } from './db';
import { users, profiles } from './schema';

const seeder = createSeeder(db);
const seedUserId = fakeData.uuid();

// seedAll processes dependencies first; each dependency is a complete seed config.
const results = await seeder.seedAll([{
  table: profiles,
  dependencies: [{
    table: users,
    data: [{ id: seedUserId, email: 'seed@example.com', name: 'Seed user' }]
  }],
  data: [{ userId: seedUserId, bio: 'Development profile' }]
}]);

const generated = await seeder.seed({
  table: users,
  onConflict: 'skip',
  data: () => fakeData.array(10, (index) => ({
    email: `generated${index}@example.com`,
    name: `User ${index}`
  }))
});

// Destructive reset, if explicitly required for a disposable database:
// await seeder.reset([profiles, users]);

fakeData.pick(['admin', 'user']);
fakeData.int(1, 100);
fakeData.bool();
fakeData.date(new Date('2026-01-01'), new Date('2026-12-31'));
```

`SeederConfig<TTable>` accepts a table, an array or synchronous data factory, optional `truncate`, `onConflict`, and nested `dependencies`. `seed()` returns `{ table, inserted, truncated }`; `seedAll()` returns an array including dependency results. Dependencies are traversed by `seedAll()`, not `seed()`, with no deduplication or cycle detection. Seeding does not wrap all work in a transaction.

`onConflict: 'skip'` is the default and uses `ON CONFLICT DO NOTHING`. Although the type also accepts `'update'`, **that branch currently performs a plain insert, not an upsert**; use `bulkUpsert()` when conflict updates are required. Skip counts fall back to input length if the driver omits `rowCount`.

`fakeData` exports `uuid()`, `pick(array)`, `int(min, max)` (inclusive), `bool()`, `date(start, end)`, and `array(count, factory)`. Provide a nonempty array to `pick()` and valid bounds to the range helpers. These are nondeterministic development-data helpers, not a seeded random generator.

## Repository composition example

This combines typed optional filters, soft deletion, stable ordering, pagination, and transactional writes using the `db` and `schema.ts` above:

```typescript
import { and, eq } from 'drizzle-orm';
import {
  paginate, buildSearchFilter, withSoftDelete,
  runTransaction, getSoftDeleteValues
} from '@frankfmy/db-utils';
import { db } from './db';
import { users } from './schema';

export const userRepository = {
  async findAll(params: { page?: number; limit?: number; search?: string } = {}) {
    const active = withSoftDelete({
      deletedAtColumn: users.deletedAt,
      isDeletedColumn: users.isDeleted
    });
    const search = params.search === undefined ? undefined : buildSearchFilter({
      query: params.search,
      columns: [users.name, users.email]
    });
    const query = db.select().from(users)
      .where(and(active, search)).orderBy(users.id).$dynamic();
    return await paginate(query, params);
  },

  async findById(id: string) {
    const [user] = await db.select().from(users).where(and(
      eq(users.id, id),
      withSoftDelete({ deletedAtColumn: users.deletedAt, isDeletedColumn: users.isDeleted })
    ));
    return user;
  },

  async create(data: { email: string; name: string }) {
    return runTransaction(db, async (tx) => {
      const [user] = await tx.insert(users).values(data).returning();
      return user;
    });
  },

  async softDelete(id: string) {
    await db.update(users).set(getSoftDeleteValues()).where(eq(users.id, id));
  }
};
```

Validate incoming pagination values before calling this repository, and enforce authentication and authorization in your application. These helpers do not provide either.

## Author and license

By [Artem Prianishnikov](https://github.com/FrankFMY) (FrankFMY).

[Email](mailto:Pryanishnikovartem@gmail.com) · [Proton Mail](mailto:frankfmy@proton.me) · [Telegram](https://t.me/FrankFMY) · [LinkedIn](https://www.linkedin.com/in/frankfmy/) · [X](https://x.com/FrankFMY) · [Website](https://frankfmy.com) · [GitHub](https://github.com/FrankFMY) · [npm](https://www.npmjs.com/~frankfmy)

The current author-owned source is licensed under Apache-2.0; see [LICENSE](./LICENSE) and [NOTICE](./NOTICE). Previously published versions **1.1.1 and earlier remain under their original PolyForm Noncommercial license**. This change does not retroactively relicense those releases or third-party code.
