/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * Утилиты для работы с датами
 */

const MONTHS_RU = [
	'января',
	'февраля',
	'марта',
	'апреля',
	'мая',
	'июня',
	'июля',
	'августа',
	'сентября',
	'октября',
	'ноября',
	'декабря'
] as const;

const MONTHS_RU_NOMINATIVE = [
	'январь',
	'февраль',
	'март',
	'апрель',
	'май',
	'июнь',
	'июль',
	'август',
	'сентябрь',
	'октябрь',
	'ноябрь',
	'декабрь'
] as const;

const WEEKDAYS_RU = [
	'воскресенье',
	'понедельник',
	'вторник',
	'среда',
	'четверг',
	'пятница',
	'суббота'
] as const;

const WEEKDAYS_RU_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'] as const;

/**
 * Форматировать дату в русском формате
 * @example formatDateRU(new Date()) // "3 декабря 2025"
 */
export function formatDateRU(date: Date | string | number): string {
	const d = toDate(date);
	const day = d.getDate();
	const month = MONTHS_RU[d.getMonth()];
	const year = d.getFullYear();
	return `${day} ${month} ${year}`;
}

/**
 * Форматировать дату и время в русском формате
 * @example formatDateTimeRU(new Date()) // "3 декабря 2025, 14:30"
 */
export function formatDateTimeRU(date: Date | string | number): string {
	const d = toDate(date);
	const dateStr = formatDateRU(d);
	const hours = String(d.getHours()).padStart(2, '0');
	const minutes = String(d.getMinutes()).padStart(2, '0');
	return `${dateStr}, ${hours}:${minutes}`;
}

/**
 * Форматировать дату в ISO формате (YYYY-MM-DD)
 */
export function formatDateISO(date: Date | string | number): string {
	const d = toDate(date);
	const year = d.getFullYear();
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

/**
 * Форматировать дату в коротком формате
 * @example formatDateShort(new Date()) // "03.12.2025"
 */
export function formatDateShort(date: Date | string | number): string {
	const d = toDate(date);
	const day = String(d.getDate()).padStart(2, '0');
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const year = d.getFullYear();
	return `${day}.${month}.${year}`;
}

/**
 * Форматировать относительное время
 * @example formatRelativeTime(new Date(Date.now() - 3600000)) // "1 час назад"
 */
export function formatRelativeTime(date: Date | string | number): string {
	const d = toDate(date);
	const now = new Date();
	const diffMs = now.getTime() - d.getTime();
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHour = Math.floor(diffMin / 60);
	const diffDay = Math.floor(diffHour / 24);
	const diffWeek = Math.floor(diffDay / 7);
	const diffMonth = Math.floor(diffDay / 30);
	const diffYear = Math.floor(diffDay / 365);

	if (diffSec < 60) {
		return 'только что';
	}
	if (diffMin < 60) {
		return `${diffMin} ${pluralizeMinutes(diffMin)} назад`;
	}
	if (diffHour < 24) {
		return `${diffHour} ${pluralizeHours(diffHour)} назад`;
	}
	if (diffDay < 7) {
		return `${diffDay} ${pluralizeDays(diffDay)} назад`;
	}
	if (diffWeek < 4) {
		return `${diffWeek} ${pluralizeWeeks(diffWeek)} назад`;
	}
	if (diffMonth < 12) {
		return `${diffMonth} ${pluralizeMonths(diffMonth)} назад`;
	}
	return `${diffYear} ${pluralizeYears(diffYear)} назад`;
}

/**
 * Форматировать длительность в мс
 * @example formatDuration(5400000) // "1ч 30м"
 */
export function formatDuration(ms: number): string {
	const seconds = Math.floor(ms / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) {
		const remainingHours = hours % 24;
		return remainingHours > 0 ? `${days}д ${remainingHours}ч` : `${days}д`;
	}
	if (hours > 0) {
		const remainingMinutes = minutes % 60;
		return remainingMinutes > 0 ? `${hours}ч ${remainingMinutes}м` : `${hours}ч`;
	}
	if (minutes > 0) {
		const remainingSeconds = seconds % 60;
		return remainingSeconds > 0 ? `${minutes}м ${remainingSeconds}с` : `${minutes}м`;
	}
	return `${seconds}с`;
}

/**
 * Добавить дни к дате
 */
export function addDays(date: Date | string | number, days: number): Date {
	const result = toDate(date);
	result.setDate(result.getDate() + days);
	return result;
}

/**
 * Добавить месяцы к дате
 */
export function addMonths(date: Date | string | number, months: number): Date {
	const result = toDate(date);
	result.setMonth(result.getMonth() + months);
	return result;
}

/**
 * Добавить годы к дате
 */
export function addYears(date: Date | string | number, years: number): Date {
	const result = toDate(date);
	result.setFullYear(result.getFullYear() + years);
	return result;
}

/**
 * Разница в днях между датами
 */
export function diffDays(date1: Date | string | number, date2: Date | string | number): number {
	const d1 = toDate(date1);
	const d2 = toDate(date2);
	const diffTime = Math.abs(d2.getTime() - d1.getTime());
	return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Разница в часах между датами
 */
export function diffHours(date1: Date | string | number, date2: Date | string | number): number {
	const d1 = toDate(date1);
	const d2 = toDate(date2);
	const diffTime = Math.abs(d2.getTime() - d1.getTime());
	return Math.floor(diffTime / (1000 * 60 * 60));
}

/**
 * Начало дня (00:00:00.000)
 */
export function startOfDay(date: Date | string | number): Date {
	const result = toDate(date);
	result.setHours(0, 0, 0, 0);
	return result;
}

/**
 * Конец дня (23:59:59.999)
 */
export function endOfDay(date: Date | string | number): Date {
	const result = toDate(date);
	result.setHours(23, 59, 59, 999);
	return result;
}

/**
 * Начало месяца
 */
export function startOfMonth(date: Date | string | number): Date {
	const result = toDate(date);
	result.setDate(1);
	result.setHours(0, 0, 0, 0);
	return result;
}

/**
 * Конец месяца
 */
export function endOfMonth(date: Date | string | number): Date {
	const result = toDate(date);
	result.setMonth(result.getMonth() + 1, 0);
	result.setHours(23, 59, 59, 999);
	return result;
}

/**
 * Проверить, является ли дата выходным (суббота/воскресенье)
 */
export function isWeekend(date: Date | string | number): boolean {
	const d = toDate(date);
	const day = d.getDay();
	return day === 0 || day === 6;
}

/**
 * Проверить, является ли дата рабочим днем
 */
export function isBusinessDay(date: Date | string | number): boolean {
	return !isWeekend(date);
}

/**
 * Получить количество рабочих дней между датами
 */
export function getBusinessDaysCount(
	startDate: Date | string | number,
	endDate: Date | string | number
): number {
	const start = startOfDay(startDate);
	const end = startOfDay(endDate);
	let count = 0;
	const current = new Date(start);

	while (current <= end) {
		if (isBusinessDay(current)) {
			count++;
		}
		current.setDate(current.getDate() + 1);
	}

	return count;
}

/**
 * Получить название месяца на русском (родительный падеж)
 */
export function getMonthNameRU(month: number): string {
	return MONTHS_RU[month] ?? '';
}

/**
 * Получить название месяца на русском (именительный падеж)
 */
export function getMonthNameRUNominative(month: number): string {
	return MONTHS_RU_NOMINATIVE[month] ?? '';
}

/**
 * Получить название дня недели на русском
 */
export function getWeekdayNameRU(date: Date | string | number): string {
	const d = toDate(date);
	return WEEKDAYS_RU[d.getDay()] ?? '';
}

/**
 * Получить короткое название дня недели на русском
 */
export function getWeekdayNameRUShort(date: Date | string | number): string {
	const d = toDate(date);
	return WEEKDAYS_RU_SHORT[d.getDay()] ?? '';
}

/**
 * Получить московское время
 */
export function getMoscowTime(): Date {
	const now = new Date();
	return new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
}

/**
 * Проверить, является ли значение валидной датой
 */
export function isValidDate(date: unknown): date is Date {
	return date instanceof Date && !isNaN(date.getTime());
}

// === Вспомогательные функции ===

function toDate(date: Date | string | number): Date {
	if (date instanceof Date) {
		return new Date(date);
	}
	return new Date(date);
}

/**
 * Склонение слов по числительным (внутренняя функция)
 */
function pluralizeInternal(n: number, forms: [string, string, string]): string {
	const abs = Math.abs(n) % 100;
	const n1 = abs % 10;

	if (abs > 10 && abs < 20) {
		return forms[2];
	}
	if (n1 > 1 && n1 < 5) {
		return forms[1];
	}
	if (n1 === 1) {
		return forms[0];
	}
	return forms[2];
}

// Формы склонений для времени
const TIME_FORMS = {
	minutes: ['минуту', 'минуты', 'минут'] as [string, string, string],
	hours: ['час', 'часа', 'часов'] as [string, string, string],
	days: ['день', 'дня', 'дней'] as [string, string, string],
	weeks: ['неделю', 'недели', 'недель'] as [string, string, string],
	months: ['месяц', 'месяца', 'месяцев'] as [string, string, string],
	years: ['год', 'года', 'лет'] as [string, string, string]
} as const;

function pluralizeMinutes(n: number): string {
	return pluralizeInternal(n, TIME_FORMS.minutes);
}

function pluralizeHours(n: number): string {
	return pluralizeInternal(n, TIME_FORMS.hours);
}

function pluralizeDays(n: number): string {
	return pluralizeInternal(n, TIME_FORMS.days);
}

function pluralizeWeeks(n: number): string {
	return pluralizeInternal(n, TIME_FORMS.weeks);
}

function pluralizeMonths(n: number): string {
	return pluralizeInternal(n, TIME_FORMS.months);
}

function pluralizeYears(n: number): string {
	return pluralizeInternal(n, TIME_FORMS.years);
}

