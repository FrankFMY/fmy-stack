# @frankfmy/core

> Universal utilities for frontend and backend

## Installation

```bash
bun add @frankfmy/core
```

## Features

### Date Utilities

```typescript
import { formatDateRU, formatRelativeTime, isBusinessDay } from '@frankfmy/core';

formatDateRU(new Date()); // "03.12.2025"
formatDateRU(new Date(), 'dd MMMM yyyy'); // "03 декабря 2025"
formatRelativeTime(new Date(Date.now() - 3600000)); // "около 1 часа назад"
isBusinessDay(new Date()); // true/false
```

### Money Utilities

```typescript
import { formatMoneyRU, calcVAT } from '@frankfmy/core';

formatMoneyRU(1234.56); // "1 234,56 ₽"
formatMoneyRU(1234.56, 'USD', 'en-US'); // "$1,234.56"

// VAT calculation
calcVAT(100, 20); // { amount: 100, vat: 20, total: 120 }
calcVAT(120, 20, true); // inclusive: { amount: 100, vat: 20, total: 120 }
```

### String Utilities

```typescript
import { pluralize, slugify, truncate, maskString } from '@frankfmy/core';

pluralize(1, ['товар', 'товара', 'товаров']); // "товар"
pluralize(3, ['товар', 'товара', 'товаров']); // "товара"
pluralize(5, ['товар', 'товара', 'товаров']); // "товаров"

slugify('Привет Мир!'); // "privet-mir"
truncate('Long text...', 10); // "Long te..."
maskString('1234567890', 4, 8); // "1234****90"
```

### Phone Utilities

```typescript
import { cleanPhone, formatPhoneRU, validatePhoneRU } from '@frankfmy/core';

cleanPhone('+7 (916) 123-45-67'); // "79161234567"
formatPhoneRU('79161234567'); // "+7 (916) 123-45-67"
validatePhoneRU('+79161234567'); // true
```

### Business Validation (Russia)

```typescript
import { validateINN, validateOGRN, validateKPP, validateSNILS } from '@frankfmy/core';

validateINN('7707083893'); // true (10 digits - organization)
validateINN('500100732259'); // true (12 digits - individual)
validateOGRN('1027700132195'); // true
validateKPP('770701001'); // true
validateSNILS('11223344595'); // true
```

### Crypto Utilities

```typescript
import { hashPassword, generateToken } from '@frankfmy/core';

const hash = await hashPassword('password123'); // Bcrypt hash
const token = generateToken(32); // nanoid token
```

### Array Utilities

```typescript
import { groupBy, chunk, debounce, throttle } from '@frankfmy/core';

const users = [
  { id: 1, role: 'admin' },
  { id: 2, role: 'user' },
  { id: 3, role: 'admin' }
];

groupBy(users, 'role');
// { admin: [...], user: [...] }

chunk([1, 2, 3, 4, 5], 2);
// [[1, 2], [3, 4], [5]]

const debouncedFn = debounce(search, 300);
const throttledFn = throttle(scroll, 100);
```

### Types

```typescript
import type { Result, ApiResponse, UserRole } from '@frankfmy/core';

// Result type for error handling
type Result<T, E> = { success: true; value: T } | { success: false; error: E };

// API Response type
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}
```

## License

Apache-2.0 © 2026 Artem Prianishnikov

