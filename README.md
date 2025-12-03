# FrankFMY Core Platform

> **🛡️ Enterprise TypeScript Monorepo — Initiative Development**

[![License: PolyForm Shield](https://img.shields.io/badge/License-PolyForm%20Shield-blue.svg)](LICENSE)
[![Bun](https://img.shields.io/badge/Bun-1.3+-black)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue)](https://typescriptlang.org)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.6+-ef4444)](https://turbo.build)

---

## 📦 Packages

| Package | Description | Status |
|---------|-------------|--------|
| `@frankfmy/core` | Universal utilities (dates, money, strings, phone, business-ru, crypto) | ✅ |
| `@frankfmy/validation` | ArkType validation schemas (Email, PhoneRU, INN, OGRN, Password) | ✅ |
| `@frankfmy/ui` | Svelte 5 + Tailwind v4 components (Button, Input, DataTable, Modal) | ✅ |
| `@frankfmy/elysia-kit` | ElysiaJS backend framework (createApp, AuthPlugin, middleware) | ✅ |
| `@frankfmy/db-utils` | Drizzle ORM helpers (BaseEntity, pagination, soft-delete, transactions) | ✅ |

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/FrankFMY/fmy-stack.git
cd fmy-stack

# Install dependencies
bun install

# Build all packages
bun run build

# Development mode
bun run dev
```

---

## 🏗️ Architecture

```
frankfmy/
├── packages/
│   ├── core/           # Universal utilities
│   ├── validation/     # ArkType schemas
│   ├── ui/             # Svelte 5 components
│   ├── elysia-kit/     # Backend framework
│   └── db-utils/       # Drizzle ORM helpers
├── scripts/
│   └── add-copyright.ts
├── turbo.json          # Turborepo configuration
├── tsconfig.base.json  # Base TypeScript config
├── LICENSE             # PolyForm Shield License
└── NOTICE              # IP Rights Notice
```

---

## 📚 Package Documentation

### @frankfmy/core

Universal utilities for frontend and backend:

```typescript
import {
  formatDateRU,
  formatMoneyRU,
  pluralize,
  validateINN,
  validatePhoneRU,
  hashPassword,
  groupBy
} from '@frankfmy/core';

// Date formatting
formatDateRU(new Date()); // "03.12.2025"

// Money formatting
formatMoneyRU(1234.56); // "1 234,56 ₽"

// Russian pluralization
pluralize(5, ['день', 'дня', 'дней']); // "дней"

// Business validation (Russia)
validateINN('7707083893'); // true
validatePhoneRU('+79161234567'); // true
```

### @frankfmy/validation

ArkType-based validation schemas:

```typescript
import { Email, PhoneRU, INN, PasswordStrong, UserCreate } from '@frankfmy/validation';

// Email validation
const emailResult = Email('user@example.com');

// Russian phone validation
const phoneResult = PhoneRU('+79161234567');

// Strong password
const passwordResult = PasswordStrong('MyP@ssw0rd!');

// User creation schema
const userResult = UserCreate({
  email: 'user@example.com',
  phone: '+79161234567',
  password: 'MyP@ssw0rd!',
  firstName: 'Иван',
  lastName: 'Иванов'
});
```

### @frankfmy/ui

Svelte 5 components with Tailwind CSS v4:

```svelte
<script>
  import {
    Button,
    Input,
    DataTable,
    Toast,
    Modal,
    ThemeProvider,
    ThemeSwitcher
  } from '@frankfmy/ui';
</script>

<ThemeProvider>
  <Button variant="primary">Click me</Button>
  <Input placeholder="Enter text..." />
  <ThemeSwitcher />
</ThemeProvider>
```

### @frankfmy/elysia-kit

ElysiaJS backend framework utilities:

```typescript
import {
  createApp,
  authPlugin,
  rateLimiter,
  ApiError,
  respond
} from '@frankfmy/elysia-kit';

const app = createApp({
  name: 'My API',
  cors: { origin: true },
  swagger: { path: '/docs' }
})
  .use(authPlugin({ secret: process.env.JWT_SECRET! }))
  .use(rateLimiter({ max: 100, windowMs: 60000 }))
  .get('/users', ({ user }) => {
    if (!user) throw ApiError.unauthorized();
    return respond.success({ user });
  }, { auth: true })
  .listen(3000);
```

### @frankfmy/db-utils

Drizzle ORM helpers:

```typescript
import {
  baseEntityColumns,
  softDeleteColumns,
  paginate,
  buildSearchFilter,
  withSoftDelete,
  runTransaction,
  bulkInsert,
  createSeeder
} from '@frankfmy/db-utils';

// Schema definition
const users = pgTable('users', {
  ...baseEntityColumns,
  ...softDeleteColumns,
  email: varchar('email', { length: 255 }).unique(),
  name: varchar('name', { length: 255 })
});

// Paginated query
const result = await paginate(
  db.select().from(users).where(withSoftDelete({ deletedAtColumn: users.deletedAt })),
  { page: 1, limit: 20 }
);

// Search
const searchFilter = buildSearchFilter({
  query: 'Иван',
  columns: [users.name, users.email],
  mode: 'contains'
});

// Transaction
await runTransaction(db, async (tx) => {
  await tx.insert(users).values({ email: 'new@example.com' });
  await tx.update(users).set({ name: 'Updated' }).where(eq(users.id, '..'));
});
```

---

## 🛠️ Scripts

| Command | Description |
|---------|-------------|
| `bun run build` | Build all packages |
| `bun run dev` | Development mode with watch |
| `bun run lint` | Run linters |
| `bun run format` | Format code with Prettier |
| `bun run test` | Run tests |
| `bun run clean` | Clean build artifacts |
| `bun run copyright:add` | Add copyright headers |

---

## 📜 License

**PolyForm Shield License 1.0.0**

This software is an **INITIATIVE DEVELOPMENT** by Artyom Pryanishnikov.

- ✅ Free for non-commercial use
- ✅ Free for evaluation and testing
- ❌ Commercial use requires separate agreement
- ❌ Creating competing products prohibited

See [LICENSE](LICENSE) and [NOTICE](NOTICE) for details.

---

## 👤 Author

**Artyom Pryanishnikov**

- Email: Pryanishnikovartem@gmail.com
- GitHub: [@FrankFMY](https://github.com/FrankFMY)

---

## 🤝 Contributing

This is a private project. Contributions are accepted only by explicit agreement.

---

<div align="center">

**Made with ❤️ in Russia**

*© 2025 Artyom Pryanishnikov. All rights reserved.*

</div>
# fmy-stack
