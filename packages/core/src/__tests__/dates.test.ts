/**
 * @fileoverview Tests for date utilities
 */

import { describe, expect, test } from 'bun:test';
import {
	formatDateRU,
	formatDateTimeRU,
	formatDateISO,
	formatDateShort,
	formatRelativeTime,
	formatDuration,
	addDays,
	addMonths,
	addYears,
	diffDays,
	diffHours,
	startOfDay,
	endOfDay,
	startOfMonth,
	endOfMonth,
	isWeekend,
	isBusinessDay,
	getBusinessDaysCount,
	getMonthNameRU,
	getMonthNameRUNominative,
	getWeekdayNameRU,
	getWeekdayNameRUShort,
	isValidDate
} from '../dates/index.js';

describe('formatDateRU', () => {
	test('should format date in Russian', () => {
		const date = new Date('2025-12-03');
		expect(formatDateRU(date)).toBe('3 декабря 2025');
	});

	test('should handle string input', () => {
		expect(formatDateRU('2025-01-15')).toBe('15 января 2025');
	});

	test('should handle timestamp', () => {
		const timestamp = new Date('2025-06-20').getTime();
		expect(formatDateRU(timestamp)).toBe('20 июня 2025');
	});
});

describe('formatDateTimeRU', () => {
	test('should format date and time', () => {
		const date = new Date('2025-12-03T14:30:00');
		expect(formatDateTimeRU(date)).toBe('3 декабря 2025, 14:30');
	});
});

describe('formatDateISO', () => {
	test('should format as ISO date', () => {
		const date = new Date('2025-12-03');
		expect(formatDateISO(date)).toBe('2025-12-03');
	});
});

describe('formatDateShort', () => {
	test('should format as DD.MM.YYYY', () => {
		const date = new Date('2025-12-03');
		expect(formatDateShort(date)).toBe('03.12.2025');
	});
});

describe('formatRelativeTime', () => {
	test('should format as "только что" for recent times', () => {
		const now = new Date();
		expect(formatRelativeTime(now)).toBe('только что');
	});

	test('should format minutes ago', () => {
		const date = new Date(Date.now() - 5 * 60 * 1000);
		expect(formatRelativeTime(date)).toMatch(/5 минут назад/);
	});

	test('should format hours ago', () => {
		const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
		expect(formatRelativeTime(date)).toMatch(/3 часа назад/);
	});

	test('should format days ago', () => {
		const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
		expect(formatRelativeTime(date)).toMatch(/2 дня назад/);
	});
});

describe('formatDuration', () => {
	test('should format seconds', () => {
		expect(formatDuration(5000)).toBe('5с');
	});

	test('should format minutes and seconds', () => {
		expect(formatDuration(125000)).toBe('2м 5с');
	});

	test('should format hours and minutes', () => {
		expect(formatDuration(5400000)).toBe('1ч 30м');
	});

	test('should format days and hours', () => {
		expect(formatDuration(90000000)).toBe('1д 1ч');
	});
});

describe('addDays', () => {
	test('should add days', () => {
		const date = new Date('2025-01-01');
		const result = addDays(date, 5);
		expect(formatDateISO(result)).toBe('2025-01-06');
	});

	test('should subtract days', () => {
		const date = new Date('2025-01-10');
		const result = addDays(date, -5);
		expect(formatDateISO(result)).toBe('2025-01-05');
	});
});

describe('addMonths', () => {
	test('should add months', () => {
		const date = new Date('2025-01-15');
		const result = addMonths(date, 2);
		expect(formatDateISO(result)).toBe('2025-03-15');
	});
});

describe('addYears', () => {
	test('should add years', () => {
		const date = new Date('2025-06-15');
		const result = addYears(date, 3);
		expect(formatDateISO(result)).toBe('2028-06-15');
	});
});

describe('diffDays', () => {
	test('should calculate days between dates', () => {
		const date1 = new Date('2025-01-01');
		const date2 = new Date('2025-01-10');
		expect(diffDays(date1, date2)).toBe(9);
	});

	test('should work regardless of order', () => {
		const date1 = new Date('2025-01-10');
		const date2 = new Date('2025-01-01');
		expect(diffDays(date1, date2)).toBe(9);
	});
});

describe('diffHours', () => {
	test('should calculate hours between dates', () => {
		const date1 = new Date('2025-01-01T00:00:00');
		const date2 = new Date('2025-01-01T12:30:00');
		expect(diffHours(date1, date2)).toBe(12);
	});
});

describe('startOfDay and endOfDay', () => {
	test('should get start of day', () => {
		const date = new Date('2025-06-15T14:30:45');
		const start = startOfDay(date);
		expect(start.getHours()).toBe(0);
		expect(start.getMinutes()).toBe(0);
		expect(start.getSeconds()).toBe(0);
	});

	test('should get end of day', () => {
		const date = new Date('2025-06-15T14:30:45');
		const end = endOfDay(date);
		expect(end.getHours()).toBe(23);
		expect(end.getMinutes()).toBe(59);
		expect(end.getSeconds()).toBe(59);
	});
});

describe('startOfMonth and endOfMonth', () => {
	test('should get start of month', () => {
		const date = new Date('2025-06-15');
		const start = startOfMonth(date);
		expect(start.getDate()).toBe(1);
	});

	test('should get end of month', () => {
		const date = new Date('2025-06-15');
		const end = endOfMonth(date);
		expect(end.getDate()).toBe(30); // June has 30 days
	});

	test('should handle February', () => {
		const date = new Date('2025-02-15');
		const end = endOfMonth(date);
		expect(end.getDate()).toBe(28); // 2025 is not leap year
	});
});

describe('isWeekend and isBusinessDay', () => {
	test('should detect weekend', () => {
		const saturday = new Date('2025-06-14'); // Saturday
		const sunday = new Date('2025-06-15'); // Sunday
		const monday = new Date('2025-06-16'); // Monday

		expect(isWeekend(saturday)).toBe(true);
		expect(isWeekend(sunday)).toBe(true);
		expect(isWeekend(monday)).toBe(false);
	});

	test('should detect business day', () => {
		const monday = new Date('2025-06-16');
		const sunday = new Date('2025-06-15');

		expect(isBusinessDay(monday)).toBe(true);
		expect(isBusinessDay(sunday)).toBe(false);
	});
});

describe('getBusinessDaysCount', () => {
	test('should count business days', () => {
		const start = new Date('2025-06-09'); // Monday
		const end = new Date('2025-06-15'); // Sunday
		expect(getBusinessDaysCount(start, end)).toBe(5); // Mon-Fri
	});
});

describe('getMonthNameRU', () => {
	test('should return month name in genitive', () => {
		expect(getMonthNameRU(0)).toBe('января');
		expect(getMonthNameRU(11)).toBe('декабря');
	});
});

describe('getMonthNameRUNominative', () => {
	test('should return month name in nominative', () => {
		expect(getMonthNameRUNominative(0)).toBe('январь');
		expect(getMonthNameRUNominative(11)).toBe('декабрь');
	});
});

describe('getWeekdayNameRU', () => {
	test('should return weekday name', () => {
		const monday = new Date('2025-06-16');
		expect(getWeekdayNameRU(monday)).toBe('понедельник');
	});
});

describe('getWeekdayNameRUShort', () => {
	test('should return short weekday name', () => {
		const monday = new Date('2025-06-16');
		expect(getWeekdayNameRUShort(monday)).toBe('пн');
	});
});

describe('isValidDate', () => {
	test('should validate dates', () => {
		expect(isValidDate(new Date())).toBe(true);
		expect(isValidDate(new Date('2025-01-01'))).toBe(true);
		expect(isValidDate(new Date('invalid'))).toBe(false);
		expect(isValidDate('not a date' as unknown as Date)).toBe(false);
	});
});

