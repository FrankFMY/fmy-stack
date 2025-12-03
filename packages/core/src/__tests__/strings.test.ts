/**
 * @fileoverview Tests for string utilities
 */

import { describe, expect, test } from 'bun:test';
import {
	pluralize,
	pluralizeWithNumber,
	capitalize,
	titleCase,
	slugify,
	truncate,
	stripHtml,
	escapeHtml,
	unescapeHtml,
	highlightText,
	extractEmails,
	extractUrls,
	maskEmail,
	maskPhone,
	normalizeSpaces,
	isAlpha,
	isAlphanumeric,
	formatNumber,
	formatPercent,
	randomString,
	wordCount,
	transliterate
} from '../strings/index.js';

describe('pluralize', () => {
	const dayForms: [string, string, string] = ['день', 'дня', 'дней'];

	test('should return singular form for 1', () => {
		expect(pluralize(1, dayForms)).toBe('день');
		expect(pluralize(21, dayForms)).toBe('день');
		expect(pluralize(101, dayForms)).toBe('день');
	});

	test('should return dual form for 2-4', () => {
		expect(pluralize(2, dayForms)).toBe('дня');
		expect(pluralize(3, dayForms)).toBe('дня');
		expect(pluralize(4, dayForms)).toBe('дня');
		expect(pluralize(22, dayForms)).toBe('дня');
	});

	test('should return plural form for 5+', () => {
		expect(pluralize(5, dayForms)).toBe('дней');
		expect(pluralize(11, dayForms)).toBe('дней');
		expect(pluralize(12, dayForms)).toBe('дней');
		expect(pluralize(20, dayForms)).toBe('дней');
		expect(pluralize(0, dayForms)).toBe('дней');
	});

	test('should handle negative numbers', () => {
		expect(pluralize(-1, dayForms)).toBe('день');
		expect(pluralize(-5, dayForms)).toBe('дней');
	});
});

describe('pluralizeWithNumber', () => {
	test('should combine number with pluralized form', () => {
		const forms: [string, string, string] = ['день', 'дня', 'дней'];
		expect(pluralizeWithNumber(1, forms)).toBe('1 день');
		expect(pluralizeWithNumber(5, forms)).toBe('5 дней');
	});
});

describe('capitalize', () => {
	test('should capitalize first letter', () => {
		expect(capitalize('hello')).toBe('Hello');
		expect(capitalize('HELLO')).toBe('HELLO');
		expect(capitalize('привет')).toBe('Привет');
	});

	test('should handle empty string', () => {
		expect(capitalize('')).toBe('');
	});
});

describe('titleCase', () => {
	test('should capitalize each word', () => {
		expect(titleCase('hello world')).toBe('Hello World');
		expect(titleCase('HELLO WORLD')).toBe('Hello World');
	});
});

describe('slugify', () => {
	test('should create URL-safe slug', () => {
		expect(slugify('Hello World')).toBe('hello-world');
		expect(slugify('Привет Мир')).toBe('privet-mir');
		expect(slugify('Hello  World!')).toBe('hello-world');
	});

	test('should handle special characters', () => {
		expect(slugify('Test @#$ 123')).toBe('test-123');
	});
});

describe('truncate', () => {
	test('should truncate long strings', () => {
		expect(truncate('Hello World', 8)).toBe('Hello...');
		expect(truncate('Hello World', 8, '…')).toBe('Hello W…');
	});

	test('should not truncate short strings', () => {
		expect(truncate('Hello', 10)).toBe('Hello');
	});
});

describe('stripHtml', () => {
	test('should remove HTML tags', () => {
		expect(stripHtml('<p>Hello <b>World</b></p>')).toBe('Hello World');
		expect(stripHtml('<script>alert("xss")</script>Text')).toBe('alert("xss")Text');
	});
});

describe('escapeHtml and unescapeHtml', () => {
	test('should escape HTML entities', () => {
		expect(escapeHtml('<div class="test">&</div>')).toBe(
			'&lt;div class=&quot;test&quot;&gt;&amp;&lt;/div&gt;'
		);
	});

	test('should unescape HTML entities', () => {
		expect(unescapeHtml('&lt;div&gt;&amp;&lt;/div&gt;')).toBe('<div>&</div>');
	});
});

describe('highlightText', () => {
	test('should wrap matches in mark tag', () => {
		expect(highlightText('Hello World', 'wor')).toBe('Hello <mark>Wor</mark>ld');
	});

	test('should use custom tag', () => {
		expect(highlightText('Hello World', 'world', 'strong')).toBe('Hello <strong>World</strong>');
	});

	test('should handle empty query', () => {
		expect(highlightText('Hello', '')).toBe('Hello');
	});
});

describe('extractEmails', () => {
	test('should extract email addresses', () => {
		const text = 'Contact us at info@example.com or support@test.org';
		expect(extractEmails(text)).toEqual(['info@example.com', 'support@test.org']);
	});

	test('should return empty array if no emails', () => {
		expect(extractEmails('No emails here')).toEqual([]);
	});
});

describe('extractUrls', () => {
	test('should extract URLs', () => {
		const text = 'Visit https://example.com or http://test.org/page';
		expect(extractUrls(text)).toEqual(['https://example.com', 'http://test.org/page']);
	});
});

describe('maskEmail', () => {
	test('should mask email address', () => {
		expect(maskEmail('john.doe@gmail.com')).toBe('j***@gmail.com');
		expect(maskEmail('test@example.com')).toBe('t***@example.com');
	});
});

describe('maskPhone', () => {
	test('should mask phone number', () => {
		expect(maskPhone('+79991234567')).toBe('+7 *** 123-45-67');
		expect(maskPhone('89991234567')).toBe('+7 *** 123-45-67');
	});
});

describe('normalizeSpaces', () => {
	test('should normalize whitespace', () => {
		expect(normalizeSpaces('  hello   world  ')).toBe('hello world');
		expect(normalizeSpaces('test\n\ttab')).toBe('test tab');
	});
});

describe('isAlpha and isAlphanumeric', () => {
	test('should validate alpha strings', () => {
		expect(isAlpha('Hello')).toBe(true);
		expect(isAlpha('Привет')).toBe(true);
		expect(isAlpha('Hello123')).toBe(false);
	});

	test('should validate alphanumeric strings', () => {
		expect(isAlphanumeric('Hello123')).toBe(true);
		expect(isAlphanumeric('Привет2025')).toBe(true);
		expect(isAlphanumeric('Hello!')).toBe(false);
	});
});

describe('formatNumber', () => {
	test('should format numbers with spaces', () => {
		expect(formatNumber(1234567)).toBe('1 234 567');
		expect(formatNumber(123)).toBe('123');
	});
});

describe('formatPercent', () => {
	test('should format as percentage', () => {
		expect(formatPercent(0.1567)).toBe('15.67%');
		expect(formatPercent(0.5, 0)).toBe('50%');
	});
});

describe('randomString', () => {
	test('should generate random string', () => {
		const str = randomString(10);
		expect(str).toHaveLength(10);
	});

	test('should use custom charset', () => {
		const str = randomString(10, 'abc');
		expect(str).toMatch(/^[abc]+$/);
	});
});

describe('wordCount', () => {
	test('should count words', () => {
		expect(wordCount('Hello World')).toBe(2);
		expect(wordCount('  One   Two  Three  ')).toBe(3);
		expect(wordCount('')).toBe(0);
	});
});

describe('transliterate', () => {
	test('should transliterate Cyrillic to Latin', () => {
		expect(transliterate('Привет')).toBe('Privet');
		expect(transliterate('Москва')).toBe('Moskva');
		expect(transliterate('щука')).toBe('schuka');
	});

	test('should preserve non-Cyrillic characters', () => {
		expect(transliterate('Hello Мир')).toBe('Hello Mir');
	});
});
