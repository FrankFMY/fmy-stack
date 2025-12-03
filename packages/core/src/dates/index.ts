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
 * Форматирует дату в русском формате: "день месяц год".
 * Использует родительный падеж для названия месяца.
 * @param date - Дата в виде Date, строки или числа (timestamp)
 * @returns Отформатированная строка даты на русском языке
 * @example
 * formatDateRU(new Date('2025-12-03')) // "3 декабря 2025"
 */
export function formatDateRU(date: Date | string | number): string {
	const d = toDate(date);
	const day = d.getDate();
	const month = MONTHS_RU[d.getMonth()];
	const year = d.getFullYear();
	return `${day} ${month} ${year}`;
}

/**
 * Форматирует дату и время в русском формате: "день месяц год, ЧЧ:ММ".
 * Использует родительный падеж для названия месяца.
 * @param date - Дата в виде Date, строки или числа (timestamp)
 * @returns Отформатированная строка даты и времени на русском языке
 * @example
 * formatDateTimeRU(new Date('2025-12-03T14:30:00')) // "3 декабря 2025, 14:30"
 */
export function formatDateTimeRU(date: Date | string | number): string {
	const d = toDate(date);
	const dateStr = formatDateRU(d);
	const hours = String(d.getHours()).padStart(2, '0');
	const minutes = String(d.getMinutes()).padStart(2, '0');
	return `${dateStr}, ${hours}:${minutes}`;
}

/**
 * Форматирует дату в ISO формате (YYYY-MM-DD).
 * Стандартный формат для работы с датами в API и базах данных.
 * @param date - Дата в виде Date, строки или числа (timestamp)
 * @returns Строка даты в формате ISO (YYYY-MM-DD)
 * @example
 * formatDateISO(new Date('2025-12-03')) // "2025-12-03"
 */
export function formatDateISO(date: Date | string | number): string {
	const d = toDate(date);
	const year = d.getFullYear();
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

/**
 * Форматирует дату в коротком формате: "ДД.ММ.ГГГГ".
 * Удобно для компактного отображения дат.
 * @param date - Дата в виде Date, строки или числа (timestamp)
 * @returns Отформатированная строка даты в формате ДД.ММ.ГГГГ
 * @example
 * formatDateShort(new Date('2025-12-03')) // "03.12.2025"
 */
export function formatDateShort(date: Date | string | number): string {
	const d = toDate(date);
	const day = String(d.getDate()).padStart(2, '0');
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const year = d.getFullYear();
	return `${day}.${month}.${year}`;
}

/**
 * Форматирует относительное время в виде "N единиц времени назад".
 * Автоматически выбирает подходящую единицу времени (секунды, минуты, часы, дни, недели, месяцы, годы)
 * и использует правильное склонение на русском языке.
 * @param date - Дата в виде Date, строки или числа (timestamp)
 * @returns Строка с относительным временем на русском языке (например, "5 минут назад", "2 часа назад")
 * @example
 * formatRelativeTime(new Date(Date.now() - 3600000)) // "1 час назад"
 * formatRelativeTime(new Date(Date.now() - 86400000)) // "1 день назад"
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
 * Форматирует длительность в миллисекундах в читаемый формат.
 * Показывает дни, часы, минуты и секунды в компактном формате.
 * @param ms - Длительность в миллисекундах
 * @returns Отформатированная строка длительности (например, "1ч 30м", "2д 5ч", "45с")
 * @example
 * formatDuration(5400000) // "1ч 30м"
 * formatDuration(90000000) // "1д 1ч"
 * formatDuration(45000) // "45с"
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
 * Добавляет указанное количество дней к дате.
 * Возвращает новый объект Date, исходная дата не изменяется.
 * @param date - Исходная дата в виде Date, строки или числа (timestamp)
 * @param days - Количество дней для добавления (может быть отрицательным для вычитания)
 * @returns Новая дата с добавленными днями
 * @example
 * addDays(new Date('2025-12-03'), 5) // Дата на 5 дней позже
 * addDays(new Date('2025-12-03'), -2) // Дата на 2 дня раньше
 */
export function addDays(date: Date | string | number, days: number): Date {
	const result = toDate(date);
	result.setDate(result.getDate() + days);
	return result;
}

/**
 * Добавляет указанное количество месяцев к дате.
 * Автоматически корректирует день месяца, если в результирующем месяце меньше дней.
 * Возвращает новый объект Date, исходная дата не изменяется.
 * @param date - Исходная дата в виде Date, строки или числа (timestamp)
 * @param months - Количество месяцев для добавления (может быть отрицательным для вычитания)
 * @returns Новая дата с добавленными месяцами
 * @example
 * addMonths(new Date('2025-01-31'), 1) // 28 февраля 2025 (корректировка дня)
 * addMonths(new Date('2025-12-03'), 2) // 3 февраля 2026
 */
export function addMonths(date: Date | string | number, months: number): Date {
	const result = toDate(date);
	result.setMonth(result.getMonth() + months);
	return result;
}

/**
 * Добавляет указанное количество лет к дате.
 * Возвращает новый объект Date, исходная дата не изменяется.
 * @param date - Исходная дата в виде Date, строки или числа (timestamp)
 * @param years - Количество лет для добавления (может быть отрицательным для вычитания)
 * @returns Новая дата с добавленными годами
 * @example
 * addYears(new Date('2025-12-03'), 1) // 3 декабря 2026
 * addYears(new Date('2025-12-03'), -5) // 3 декабря 2020
 */
export function addYears(date: Date | string | number, years: number): Date {
	const result = toDate(date);
	result.setFullYear(result.getFullYear() + years);
	return result;
}

/**
 * Вычисляет разницу в днях между двумя датами.
 * Возвращает абсолютное значение (всегда положительное число).
 * @param date1 - Первая дата в виде Date, строки или числа (timestamp)
 * @param date2 - Вторая дата в виде Date, строки или числа (timestamp)
 * @returns Количество дней между датами (всегда положительное число)
 * @example
 * diffDays(new Date('2025-12-03'), new Date('2025-12-10')) // 7
 * diffDays(new Date('2025-12-10'), new Date('2025-12-03')) // 7
 */
export function diffDays(date1: Date | string | number, date2: Date | string | number): number {
	const d1 = toDate(date1);
	const d2 = toDate(date2);
	const diffTime = Math.abs(d2.getTime() - d1.getTime());
	return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Вычисляет разницу в часах между двумя датами.
 * Возвращает абсолютное значение (всегда положительное число).
 * @param date1 - Первая дата в виде Date, строки или числа (timestamp)
 * @param date2 - Вторая дата в виде Date, строки или числа (timestamp)
 * @returns Количество часов между датами (всегда положительное число)
 * @example
 * diffHours(new Date('2025-12-03T10:00'), new Date('2025-12-03T15:30')) // 5
 */
export function diffHours(date1: Date | string | number, date2: Date | string | number): number {
	const d1 = toDate(date1);
	const d2 = toDate(date2);
	const diffTime = Math.abs(d2.getTime() - d1.getTime());
	return Math.floor(diffTime / (1000 * 60 * 60));
}

/**
 * Возвращает начало дня (00:00:00.000) для указанной даты.
 * Полезно для фильтрации данных по дням.
 * @param date - Дата в виде Date, строки или числа (timestamp)
 * @returns Дата с установленным временем на начало дня
 * @example
 * startOfDay(new Date('2025-12-03T14:30:00')) // 2025-12-03T00:00:00.000
 */
export function startOfDay(date: Date | string | number): Date {
	const result = toDate(date);
	result.setHours(0, 0, 0, 0);
	return result;
}

/**
 * Возвращает конец дня (23:59:59.999) для указанной даты.
 * Полезно для фильтрации данных по дням.
 * @param date - Дата в виде Date, строки или числа (timestamp)
 * @returns Дата с установленным временем на конец дня
 * @example
 * endOfDay(new Date('2025-12-03T14:30:00')) // 2025-12-03T23:59:59.999
 */
export function endOfDay(date: Date | string | number): Date {
	const result = toDate(date);
	result.setHours(23, 59, 59, 999);
	return result;
}

/**
 * Возвращает начало месяца (1-е число, 00:00:00.000) для указанной даты.
 * @param date - Дата в виде Date, строки или числа (timestamp)
 * @returns Дата с установленным днем на 1-е число и временем на начало дня
 * @example
 * startOfMonth(new Date('2025-12-15T14:30:00')) // 2025-12-01T00:00:00.000
 */
export function startOfMonth(date: Date | string | number): Date {
	const result = toDate(date);
	result.setDate(1);
	result.setHours(0, 0, 0, 0);
	return result;
}

/**
 * Возвращает конец месяца (последний день, 23:59:59.999) для указанной даты.
 * Автоматически учитывает количество дней в месяце (28-31).
 * @param date - Дата в виде Date, строки или числа (timestamp)
 * @returns Дата с установленным днем на последний день месяца и временем на конец дня
 * @example
 * endOfMonth(new Date('2025-12-15T14:30:00')) // 2025-12-31T23:59:59.999
 * endOfMonth(new Date('2025-02-15')) // 2025-02-28T23:59:59.999
 */
export function endOfMonth(date: Date | string | number): Date {
	const result = toDate(date);
	result.setMonth(result.getMonth() + 1, 0);
	result.setHours(23, 59, 59, 999);
	return result;
}

/**
 * Проверяет, является ли дата выходным днем (суббота или воскресенье).
 * @param date - Дата в виде Date, строки или числа (timestamp)
 * @returns `true`, если дата является субботой или воскресеньем, иначе `false`
 * @example
 * isWeekend(new Date('2025-12-06')) // true (суббота)
 * isWeekend(new Date('2025-12-07')) // true (воскресенье)
 * isWeekend(new Date('2025-12-08')) // false (понедельник)
 */
export function isWeekend(date: Date | string | number): boolean {
	const d = toDate(date);
	const day = d.getDay();
	return day === 0 || day === 6;
}

/**
 * Проверяет, является ли дата рабочим днем (не суббота и не воскресенье).
 * @param date - Дата в виде Date, строки или числа (timestamp)
 * @returns `true`, если дата является рабочим днем, иначе `false`
 * @example
 * isBusinessDay(new Date('2025-12-08')) // true (понедельник)
 * isBusinessDay(new Date('2025-12-06')) // false (суббота)
 */
export function isBusinessDay(date: Date | string | number): boolean {
	return !isWeekend(date);
}

/**
 * Вычисляет количество рабочих дней (без учета выходных) между двумя датами.
 * Включает обе граничные даты в подсчет, если они рабочие дни.
 * @param startDate - Начальная дата в виде Date, строки или числа (timestamp)
 * @param endDate - Конечная дата в виде Date, строки или числа (timestamp)
 * @returns Количество рабочих дней между датами
 * @example
 * getBusinessDaysCount(new Date('2025-12-01'), new Date('2025-12-07')) // 5 (пн-пт)
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
 * Возвращает название месяца на русском языке в родительном падеже.
 * Используется для форматирования дат типа "3 декабря".
 * @param month - Номер месяца (0-11, где 0 - январь, 11 - декабрь)
 * @returns Название месяца в родительном падеже или пустая строка, если номер невалиден
 * @example
 * getMonthNameRU(0) // 'января'
 * getMonthNameRU(11) // 'декабря'
 */
export function getMonthNameRU(month: number): string {
	return MONTHS_RU[month] ?? '';
}

/**
 * Возвращает название месяца на русском языке в именительном падеже.
 * Используется для отображения названий месяцев в списках.
 * @param month - Номер месяца (0-11, где 0 - январь, 11 - декабрь)
 * @returns Название месяца в именительном падеже или пустая строка, если номер невалиден
 * @example
 * getMonthNameRUNominative(0) // 'январь'
 * getMonthNameRUNominative(11) // 'декабрь'
 */
export function getMonthNameRUNominative(month: number): string {
	return MONTHS_RU_NOMINATIVE[month] ?? '';
}

/**
 * Возвращает полное название дня недели на русском языке.
 * @param date - Дата в виде Date, строки или числа (timestamp)
 * @returns Полное название дня недели (например, "понедельник", "вторник") или пустая строка
 * @example
 * getWeekdayNameRU(new Date('2025-12-08')) // 'понедельник'
 * getWeekdayNameRU(new Date('2025-12-06')) // 'суббота'
 */
export function getWeekdayNameRU(date: Date | string | number): string {
	const d = toDate(date);
	return WEEKDAYS_RU[d.getDay()] ?? '';
}

/**
 * Возвращает короткое название дня недели на русском языке (2 буквы).
 * @param date - Дата в виде Date, строки или числа (timestamp)
 * @returns Короткое название дня недели (например, "пн", "вт") или пустая строка
 * @example
 * getWeekdayNameRUShort(new Date('2025-12-08')) // 'пн'
 * getWeekdayNameRUShort(new Date('2025-12-06')) // 'сб'
 */
export function getWeekdayNameRUShort(date: Date | string | number): string {
	const d = toDate(date);
	return WEEKDAYS_RU_SHORT[d.getDay()] ?? '';
}

/**
 * Возвращает текущее время в часовом поясе Москвы (Europe/Moscow).
 * Полезно для работы с российскими датами и временем.
 * @returns Дата с текущим временем в часовом поясе Москвы
 * @example
 * const moscowNow = getMoscowTime(); // Текущее время в Москве
 */
export function getMoscowTime(): Date {
	const now = new Date();
	return new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
}

/**
 * Проверяет, является ли значение валидным объектом Date.
 * TypeScript type guard - сужает тип до Date при успешной проверке.
 * @param date - Значение для проверки
 * @returns `true`, если значение является валидной датой, иначе `false`
 * @example
 * const value: unknown = new Date();
 * if (isValidDate(value)) {
 *   // TypeScript знает, что value - это Date
 *   console.log(value.getFullYear());
 * }
 */
export function isValidDate(date: unknown): date is Date {
	return date instanceof Date && !Number.isNaN(date.getTime());
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

