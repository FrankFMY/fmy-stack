/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * Утилиты для работы со строками и текстом
 */

/**
 * Транслитерация кириллицы в латиницу
 */
const TRANSLIT_MAP: Record<string, string> = {
	а: 'a',
	б: 'b',
	в: 'v',
	г: 'g',
	д: 'd',
	е: 'e',
	ё: 'yo',
	ж: 'zh',
	з: 'z',
	и: 'i',
	й: 'y',
	к: 'k',
	л: 'l',
	м: 'm',
	н: 'n',
	о: 'o',
	п: 'p',
	р: 'r',
	с: 's',
	т: 't',
	у: 'u',
	ф: 'f',
	х: 'h',
	ц: 'ts',
	ч: 'ch',
	ш: 'sh',
	щ: 'sch',
	ъ: '',
	ы: 'y',
	ь: '',
	э: 'e',
	ю: 'yu',
	я: 'ya'
};

/**
 * Склонение слов по числительным
 * @example pluralize(1, ['день', 'дня', 'дней']) // 'день'
 * @example pluralize(2, ['день', 'дня', 'дней']) // 'дня'
 * @example pluralize(5, ['день', 'дня', 'дней']) // 'дней'
 */
export function pluralize(n: number, forms: [string, string, string]): string {
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

/**
 * Склонение слов по числительным с числом
 * @example pluralizeWithNumber(5, ['день', 'дня', 'дней']) // '5 дней'
 */
export function pluralizeWithNumber(n: number, forms: [string, string, string]): string {
	return `${n} ${pluralize(n, forms)}`;
}

/**
 * Капитализировать первую букву
 * @example capitalize('hello world') // 'Hello world'
 */
export function capitalize(text: string): string {
	if (!text) return '';
	return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Title Case - каждое слово с заглавной буквы
 * @example titleCase('hello world') // 'Hello World'
 */
export function titleCase(text: string): string {
	if (!text) return '';
	return text
		.toLowerCase()
		.split(' ')
		.map((word) => capitalize(word))
		.join(' ');
}

/**
 * Создать slug для URL
 * @example slugify('Привет Мир!') // 'privet-mir'
 */
export function slugify(text: string): string {
	return text
		.toLowerCase()
		.split('')
		.map((char) => TRANSLIT_MAP[char] ?? char)
		.join('')
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

/**
 * Обрезать строку до указанной длины
 * @example truncate('Hello World', 8) // 'Hello...'
 */
export function truncate(text: string, length: number, suffix = '...'): string {
	if (text.length <= length) return text;
	return text.slice(0, length - suffix.length).trimEnd() + suffix;
}

/**
 * Удалить HTML теги из строки
 */
export function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, '');
}

/**
 * Экранировать HTML символы
 */
export function escapeHtml(text: string): string {
	const escapeMap: Record<string, string> = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;'
	};
	return text.replace(/[&<>"']/g, (char) => escapeMap[char] ?? char);
}

/**
 * Деэкранировать HTML символы
 */
export function unescapeHtml(text: string): string {
	const unescapeMap: Record<string, string> = {
		'&amp;': '&',
		'&lt;': '<',
		'&gt;': '>',
		'&quot;': '"',
		'&#39;': "'"
	};
	return text.replace(/&(amp|lt|gt|quot|#39);/g, (entity) => unescapeMap[entity] ?? entity);
}

/**
 * Подсветить текст запроса в строке
 * @example highlightText('Hello World', 'wor') // 'Hello <mark>Wor</mark>ld'
 */
export function highlightText(text: string, query: string, tag = 'mark'): string {
	if (!query) return text;
	const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
	return text.replace(regex, `<${tag}>$1</${tag}>`);
}

/**
 * Извлечь email адреса из текста
 */
export function extractEmails(text: string): string[] {
	const emailRegex = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
	return text.match(emailRegex) ?? [];
}

/**
 * Извлечь URL из текста
 */
export function extractUrls(text: string): string[] {
	const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
	return text.match(urlRegex) ?? [];
}

/**
 * Маскировать email
 * @example maskEmail('john.doe@gmail.com') // 'j***@gmail.com'
 */
export function maskEmail(email: string): string {
	const [local, domain] = email.split('@');
	if (!local || !domain) return email;
	const masked = local.charAt(0) + '***';
	return `${masked}@${domain}`;
}

/**
 * Маскировать телефон
 * @example maskPhone('+79991234567') // '+7 *** 123-45-67'
 */
export function maskPhone(phone: string): string {
	const cleaned = phone.replace(/\D/g, '');
	if (cleaned.length < 10) return phone;

	const last7 = cleaned.slice(-7);
	const formatted = `${last7.slice(0, 3)}-${last7.slice(3, 5)}-${last7.slice(5)}`;

	if (cleaned.startsWith('7') || cleaned.startsWith('8')) {
		return `+7 *** ${formatted}`;
	}
	return `*** ${formatted}`;
}

/**
 * Удалить лишние пробелы
 */
export function normalizeSpaces(text: string): string {
	return text.replace(/\s+/g, ' ').trim();
}

/**
 * Проверить, содержит ли строка только буквы
 */
export function isAlpha(text: string): boolean {
	return /^[a-zA-Zа-яА-ЯёЁ]+$/.test(text);
}

/**
 * Проверить, содержит ли строка только буквы и цифры
 */
export function isAlphanumeric(text: string): boolean {
	return /^[a-zA-Zа-яА-ЯёЁ0-9]+$/.test(text);
}

/**
 * Форматировать число с разделителями
 * @example formatNumber(1234567) // '1 234 567'
 */
export function formatNumber(n: number): string {
	return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Форматировать процент
 * @example formatPercent(0.1567) // '15.67%'
 */
export function formatPercent(n: number, decimals = 2): string {
	return `${(n * 100).toFixed(decimals)}%`;
}

/**
 * Генерировать случайную строку
 */
export function randomString(length: number, charset?: string): string {
	const chars = charset ?? 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

/**
 * Подсчитать количество слов
 */
export function wordCount(text: string): number {
	return text
		.trim()
		.split(/\s+/)
		.filter((word) => word.length > 0).length;
}

/**
 * Транслитерировать кириллицу в латиницу
 */
export function transliterate(text: string): string {
	return text
		.split('')
		.map((char) => {
			const lower = char.toLowerCase();
			const translitChar = TRANSLIT_MAP[lower];
			if (translitChar === undefined) return char;
			return char === lower ? translitChar : translitChar.toUpperCase();
		})
		.join('');
}

// === Вспомогательные функции ===

function escapeRegex(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

