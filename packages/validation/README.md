# @frankfmy/validation

> ArkType validation schemas for TypeScript

## Installation

```bash
bun add @frankfmy/validation arktype
```

## Features

### Basic Validators

```typescript
import { Email, URL, UUID, PhoneRU } from '@frankfmy/validation';

// Email validation
const emailResult = Email('user@example.com');
if (emailResult instanceof Error) {
  console.error(emailResult.message);
}

// URL validation
const urlResult = URL('https://example.com');

// UUID validation
const uuidResult = UUID('550e8400-e29b-41d4-a716-446655440000');

// Russian phone number
const phoneResult = PhoneRU('+79161234567');
```

### Russian Business Validators

```typescript
import { INN, OGRN, SNILS, PassportRU } from '@frankfmy/validation';

// ИНН (Taxpayer Identification Number)
const innResult = INN('7707083893'); // 10 digits for organizations
const innResult2 = INN('500100732259'); // 12 digits for individuals

// ОГРН (Primary State Registration Number)
const ogrnResult = OGRN('1027700132195');

// СНИЛС (Insurance Number)
const snilsResult = SNILS('11223344595');

// Russian Passport
const passportResult = PassportRU({
  series: '4510',
  number: '123456',
  issueDate: '2020-01-15',
  issueAuthority: 'ОВД Москвы',
  divisionCode: '770-001'
});
```

### Password Validation

```typescript
import { PasswordStrong } from '@frankfmy/validation';

// Strong password requirements:
// - At least 8 characters
// - Contains uppercase letter
// - Contains lowercase letter
// - Contains number
// - Contains special character

const passwordResult = PasswordStrong('MyP@ssw0rd!');
```

### Money & Numbers

```typescript
import { Money, Percent, TenderBudget } from '@frankfmy/validation';

// Money (non-negative number)
const moneyResult = Money(1234.56);

// Percent (0-100)
const percentResult = Percent(75.5);

// Tender budget
const budgetResult = TenderBudget(1000000);
```

### User Schemas

```typescript
import { UserCreate } from '@frankfmy/validation';

const userResult = UserCreate({
  email: 'user@example.com',
  phone: '+79161234567',
  password: 'MyP@ssw0rd!',
  firstName: 'Иван',
  lastName: 'Иванов',
  middleName: 'Петрович' // optional
});

if (userResult instanceof Error) {
  // Handle validation errors
  console.error(userResult.message);
} else {
  // userResult is typed { email, phone, password, firstName, lastName, middleName? }
  createUser(userResult);
}
```

## Usage with ElysiaJS

```typescript
import { Elysia, t } from 'elysia';
import { Email, PhoneRU, PasswordStrong } from '@frankfmy/validation';

const app = new Elysia()
  .post('/register', async ({ body }) => {
    // Validate with ArkType
    const emailValid = Email(body.email);
    const phoneValid = PhoneRU(body.phone);
    const passwordValid = PasswordStrong(body.password);
    
    if (emailValid instanceof Error) {
      throw new Error('Invalid email');
    }
    // ... continue registration
  }, {
    body: t.Object({
      email: t.String(),
      phone: t.String(),
      password: t.String()
    })
  });
```

## Custom Validators

```typescript
import { type } from 'arktype';
import { validateINN, validatePhoneRU } from '@frankfmy/core';

// Create custom ArkType validator
const CustomINN = type('string', {
  validator: (s: string) => validateINN(s) || 'Invalid INN format'
});

// Combine validators
const CompanyData = type({
  name: 'string>3',
  inn: CustomINN,
  email: 'string.email',
  phone: PhoneRU
});
```

## License

Apache-2.0 © 2026 Artem Prianishnikov

