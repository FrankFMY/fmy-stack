# @frankfmy/db-utils

> Drizzle ORM helpers for PostgreSQL

## Installation

```bash
bun add @frankfmy/db-utils drizzle-orm
```

## Features

### Base Entity Columns

```typescript
import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { baseEntityColumns, softDeleteColumns } from '@frankfmy/db-utils';

export const users = pgTable('users', {
  ...baseEntityColumns,     // id, createdAt, updatedAt
  ...softDeleteColumns,     // deletedAt, isDeleted
  email: varchar('email', { length: 255 }).unique(),
  name: varchar('name', { length: 255 })
});
```

### Pagination

```typescript
import { paginate, buildPaginatedResult } from '@frankfmy/db-utils';

// Simple pagination
const query = db.select().from(users);
const paginatedQuery = paginate(query, { page: 1, limit: 20 });

// With total count
const [data, [{ count }]] = await Promise.all([
  paginate(db.select().from(users), { page, limit }),
  db.select({ count: sql`count(*)` }).from(users)
]);

const result = await buildPaginatedResult(data, Number(count), { page, limit });
// { data: [...], meta: { page: 1, limit: 20, total: 100, totalPages: 5, hasNext: true, hasPrev: false } }
```

### Search

```typescript
import { buildSearchFilter, buildFullTextSearch } from '@frankfmy/db-utils';

// ILIKE search across multiple columns
const filter = buildSearchFilter({
  query: 'john',
  columns: [users.name, users.email],
  mode: 'contains' // 'contains' | 'startsWith' | 'endsWith' | 'exact'
});

const results = await db.select().from(users).where(filter);

// Full-text search (requires tsvector column)
const ftFilter = buildFullTextSearch(users.searchVector, 'поиск', 'russian');
```

### Soft Delete

```typescript
import { withSoftDelete, getSoftDeleteValues, getRestoreValues } from '@frankfmy/db-utils';

// Query only non-deleted records
const activeUsers = await db
  .select()
  .from(users)
  .where(withSoftDelete({ deletedAtColumn: users.deletedAt }));

// Soft delete a record
await db
  .update(users)
  .set(getSoftDeleteValues())
  .where(eq(users.id, userId));

// Restore a soft-deleted record
await db
  .update(users)
  .set(getRestoreValues())
  .where(eq(users.id, userId));
```

### Transactions

```typescript
import { runTransaction, runTransactionWithRetry } from '@frankfmy/db-utils';

// Basic transaction
const result = await runTransaction(db, async (tx) => {
  const user = await tx.insert(users).values({ email: 'new@example.com' }).returning();
  await tx.insert(profiles).values({ userId: user[0].id });
  return user[0];
});

// Transaction with retry on deadlock
const result = await runTransactionWithRetry(
  db,
  async (tx) => {
    // ... operations
  },
  3, // maxRetries
  100 // retryDelay (ms)
);
```

### Bulk Operations

```typescript
import { bulkInsert, bulkUpdate, bulkUpsert } from '@frankfmy/db-utils';

// Bulk insert with chunking
const inserted = await bulkInsert(db, users, [
  { email: 'user1@example.com' },
  { email: 'user2@example.com' },
  // ... thousands more
], {
  chunkSize: 1000,
  skipDuplicates: true
});

// Bulk upsert
const upserted = await bulkUpsert(
  db,
  users,
  data,
  'email', // conflict target
  ['name', 'updatedAt'] // columns to update
);
```

### Database Seeding

```typescript
import { createSeeder, fakeData } from '@frankfmy/db-utils';

const seeder = createSeeder(db);

// Seed a single table
await seeder.seed({
  table: users,
  truncate: true,
  data: [
    { email: 'admin@example.com', name: 'Admin' },
    { email: 'user@example.com', name: 'User' }
  ]
});

// Seed with dependencies
await seeder.seedAll([
  {
    table: roles,
    data: [{ name: 'admin' }, { name: 'user' }]
  },
  {
    table: users,
    dependencies: [{ table: roles, data: [] }],
    data: () => fakeData.array(100, (i) => ({
      email: `user${i}@example.com`,
      name: `User ${i}`,
      role: fakeData.pick(['admin', 'user'])
    }))
  }
]);

// Fake data helpers
fakeData.uuid();              // Random UUID
fakeData.pick(['a', 'b']);    // Random item from array
fakeData.int(1, 100);         // Random integer
fakeData.bool();              // Random boolean
fakeData.date(start, end);    // Random date in range
fakeData.array(10, factory);  // Generate array with factory
```

## Example Repository

```typescript
import { db } from './db';
import { users } from './schema';
import {
  paginate,
  buildSearchFilter,
  withSoftDelete,
  runTransaction,
  getSoftDeleteValues
} from '@frankfmy/db-utils';
import { eq, and } from 'drizzle-orm';

export const userRepository = {
  async findAll(params: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 20, search } = params;
    
    const conditions = [
      withSoftDelete({ deletedAtColumn: users.deletedAt }),
      search && buildSearchFilter({
        query: search,
        columns: [users.name, users.email]
      })
    ].filter(Boolean);
    
    const query = db.select().from(users).where(and(...conditions));
    return paginate(query, { page, limit });
  },
  
  async findById(id: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.id, id),
        withSoftDelete({ deletedAtColumn: users.deletedAt })
      ));
    return user;
  },
  
  async create(data: { email: string; name: string }) {
    return runTransaction(db, async (tx) => {
      const [user] = await tx.insert(users).values(data).returning();
      // ... additional operations
      return user;
    });
  },
  
  async delete(id: string) {
    await db.update(users).set(getSoftDeleteValues()).where(eq(users.id, id));
  }
};
```

## License

Apache-2.0 © 2026 Artem Prianishnikov

