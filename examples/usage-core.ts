/**
 * @frankfmy/core - Usage Examples
 */

import {
	// Arrays
	chunk,
	debounce,
	groupBy,
	throttle,
	// Business validation
	validateINN,
	validateKPP,
	validateOGRN,
	validateSNILS,
	// Crypto
	generateToken,
	hashPassword,
	// Date utilities
	formatDateRU,
	formatRelativeTime,
	isBusinessDay,
	// Money utilities
	calcVAT,
	formatMoneyRU,
	// Phone utilities
	cleanPhone,
	formatPhoneRU,
	validatePhoneRU,
	// String utilities
	maskString,
	pluralize,
	slugify,
	truncate
} from '@frankfmy/core';

// ============================================
// DATE UTILITIES
// ============================================

console.log('=== Date Utilities ===');
console.log(formatDateRU(new Date())); // "03.12.2025"
console.log(formatDateRU(new Date(), 'dd MMMM yyyy')); // "03 декабря 2025"
console.log(formatRelativeTime(new Date(Date.now() - 3600000))); // "около 1 часа назад"
console.log('Is today a business day?', isBusinessDay(new Date()));

// ============================================
// MONEY UTILITIES
// ============================================

console.log('\n=== Money Utilities ===');
console.log(formatMoneyRU(1234.56)); // "1 234,56 ₽"
console.log(formatMoneyRU(1234.56, 'USD', 'en-US')); // "$1,234.56"

const vatResult = calcVAT(100, 20);
console.log('VAT exclusive:', vatResult); // { amount: 100, vat: 20, total: 120 }

const vatInclusive = calcVAT(120, 20, true);
console.log('VAT inclusive:', vatInclusive); // { amount: 100, vat: 20, total: 120 }

// ============================================
// STRING UTILITIES
// ============================================

console.log('\n=== String Utilities ===');
console.log(pluralize(1, ['товар', 'товара', 'товаров'])); // "товар"
console.log(pluralize(3, ['товар', 'товара', 'товаров'])); // "товара"
console.log(pluralize(5, ['товар', 'товара', 'товаров'])); // "товаров"

console.log(slugify('Привет Мир!')); // "privet-mir"
console.log(truncate('Очень длинный текст для примера', 15)); // "Очень длинный..."
console.log(maskString('1234567890123456', 4, 12)); // "1234********3456"

// ============================================
// PHONE UTILITIES
// ============================================

console.log('\n=== Phone Utilities ===');
console.log(cleanPhone('+7 (916) 123-45-67')); // "79161234567"
console.log(formatPhoneRU('79161234567')); // "+7 (916) 123-45-67"
console.log('Valid phone:', validatePhoneRU('+79161234567')); // true

// ============================================
// BUSINESS VALIDATION (RUSSIA)
// ============================================

console.log('\n=== Business Validation ===');
console.log('Valid INN (org):', validateINN('7707083893')); // true
console.log('Valid INN (ind):', validateINN('500100732259')); // true
console.log('Valid OGRN:', validateOGRN('1027700132195')); // true
console.log('Valid KPP:', validateKPP('770701001')); // true
console.log('Valid SNILS:', validateSNILS('11223344595')); // true

// ============================================
// CRYPTO UTILITIES
// ============================================

console.log('\n=== Crypto Utilities ===');
const hash = await hashPassword('password123');
console.log('Password hash:', `${hash.substring(0, 30)}...`);
console.log('Token:', generateToken(32));

// ============================================
// ARRAY UTILITIES
// ============================================

console.log('\n=== Array Utilities ===');

const users = [
	{ id: 1, name: 'Alice', role: 'admin' },
	{ id: 2, name: 'Bob', role: 'user' },
	{ id: 3, name: 'Charlie', role: 'admin' },
	{ id: 4, name: 'Diana', role: 'user' }
];

console.log('Grouped by role:', groupBy(users, 'role'));
console.log('Chunked:', chunk([1, 2, 3, 4, 5, 6, 7], 3));

// Debounce example
const _searchFn = debounce((query: string) => {
	console.log('Searching:', query);
}, 300);

// Throttle example
const _scrollFn = throttle(() => {
	console.log('Scroll event');
}, 100);
