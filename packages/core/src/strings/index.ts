/**
 * @fileoverview FMY Stack
 * @author Artem Prianishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2026 Artem Prianishnikov
 * @license Apache-2.0
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
 * Склоняет слово в зависимости от числительного по правилам русского языка.
 * Использует три формы слова: для 1, для 2-4, для 5+.
 * @param n - Число для склонения
 * @param forms - Кортеж из трех форм слова: [форма для 1, форма для 2-4, форма для 5+]
 * @returns Правильно склоненная форма слова
 * @example
 * pluralize(1, ['день', 'дня', 'дней']) // 'день'
 * pluralize(2, ['день', 'дня', 'дней']) // 'дня'
 * pluralize(5, ['день', 'дня', 'дней']) // 'дней'
 * pluralize(21, ['товар', 'товара', 'товаров']) // 'товар'
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
 * Склоняет слово и возвращает его вместе с числом в формате "N слово".
 * Удобно для отображения количества с правильным склонением.
 * @param n - Число для склонения
 * @param forms - Кортеж из трех форм слова: [форма для 1, форма для 2-4, форма для 5+]
 * @returns Строка вида "N склоненное_слово"
 * @example
 * pluralizeWithNumber(5, ['день', 'дня', 'дней']) // '5 дней'
 * pluralizeWithNumber(1, ['товар', 'товара', 'товаров']) // '1 товар'
 */
export function pluralizeWithNumber(n: number, forms: [string, string, string]): string {
	return `${n} ${pluralize(n, forms)}`;
}

/**
 * Делает первую букву строки заглавной, остальные остаются без изменений.
 * @param text - Исходная строка
 * @returns Строка с заглавной первой буквой. Пустая строка возвращается как есть
 * @example
 * capitalize('hello world') // 'Hello world'
 * capitalize('привет') // 'Привет'
 */
export function capitalize(text: string): string {
	if (!text) return '';
	return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Преобразует строку в формат Title Case (каждое слово с заглавной буквы).
 * Разделяет строку по пробелам и капитализирует каждое слово.
 * @param text - Исходная строка
 * @returns Строка, где каждое слово начинается с заглавной буквы
 * @example
 * titleCase('hello world') // 'Hello World'
 * titleCase('привет мир') // 'Привет Мир'
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
 * Преобразует строку в URL-friendly slug.
 * Транслитерирует кириллицу в латиницу, удаляет специальные символы,
 * заменяет пробелы на дефисы и приводит к нижнему регистру.
 * @param text - Исходная строка
 * @returns URL-friendly slug в нижнем регистре с дефисами
 * @example
 * slugify('Привет Мир!') // 'privet-mir'
 * slugify('Hello World 123') // 'hello-world-123'
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
 * Обрезает строку до указанной длины и добавляет суффикс, если строка была обрезана.
 * @param text - Исходная строка
 * @param length - Максимальная длина результирующей строки (включая суффикс)
 * @param suffix - Суффикс, добавляемый при обрезке, по умолчанию '...'
 * @returns Обрезанная строка с суффиксом (если была обрезана) или исходная строка
 * @example
 * truncate('Hello World', 8) // 'Hello...'
 * truncate('Short', 10) // 'Short' (не обрезана)
 * truncate('Long text', 5, '...') // 'Lo...'
 */
export function truncate(text: string, length: number, suffix = '...'): string {
	if (text.length <= length) return text;
	return text.slice(0, length - suffix.length).trimEnd() + suffix;
}

/**
 * Удаляет все HTML теги из строки, оставляя только текстовое содержимое.
 * @param html - Строка, содержащая HTML разметку
 * @returns Текстовая строка без HTML тегов
 * @example
 * stripHtml('<p>Hello <b>World</b></p>') // 'Hello World'
 */
export function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, '');
}

/**
 * Экранирует специальные HTML символы для безопасного отображения в HTML.
 * Заменяет символы &, <, >, ", ' на соответствующие HTML-сущности.
 * @param text - Исходная строка
 * @returns Строка с экранированными HTML символами
 * @example
 * escapeHtml('<script>alert("xss")</script>') // '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
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
 * Деэкранирует HTML-сущности обратно в обычные символы.
 * Обратная операция для `escapeHtml`.
 * @param text - Строка с HTML-сущностями
 * @returns Строка с восстановленными символами
 * @example
 * unescapeHtml('&lt;script&gt;') // '<script>'
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
 * Подсвечивает все вхождения подстроки в тексте, оборачивая их в HTML тег.
 * Поиск выполняется без учета регистра.
 * @param text - Исходный текст
 * @param query - Подстрока для поиска и подсветки
 * @param tag - HTML тег для оборачивания, по умолчанию 'mark'
 * @returns Строка с подсвеченными вхождениями в формате HTML
 * @example
 * highlightText('Hello World', 'wor') // 'Hello <mark>Wor</mark>ld'
 * highlightText('Test test', 'test', 'strong') // '<strong>Test</strong> <strong>test</strong>'
 */
export function highlightText(text: string, query: string, tag = 'mark'): string {
	if (!query) return text;
	const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
	return text.replace(regex, `<${tag}>$1</${tag}>`);
}

/**
 * Извлекает все email адреса из текста с помощью регулярного выражения.
 * @param text - Исходный текст, который может содержать email адреса
 * @returns Массив найденных email адресов. Если адреса не найдены, возвращает пустой массив
 * @example
 * extractEmails('Contact us at info@example.com or support@test.org') // ['info@example.com', 'support@test.org']
 */
export function extractEmails(text: string): string[] {
	const emailRegex = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
	return text.match(emailRegex) ?? [];
}

/**
 * Извлекает все HTTP/HTTPS URL из текста.
 * @param text - Исходный текст, который может содержать URL
 * @returns Массив найденных URL. Если URL не найдены, возвращает пустой массив
 * @example
 * extractUrls('Visit https://example.com and http://test.org') // ['https://example.com', 'http://test.org']
 */
export function extractUrls(text: string): string[] {
	const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
	return text.match(urlRegex) ?? [];
}

/**
 * Маскирует email адрес, оставляя только первую букву локальной части.
 * Полезно для защиты персональных данных при отображении.
 * @param email - Email адрес для маскировки
 * @returns Замаскированный email в формате 'X***@domain.com'
 * @example
 * maskEmail('john.doe@gmail.com') // 'j***@gmail.com'
 * maskEmail('test@example.com') // 't***@example.com'
 */
export function maskEmail(email: string): string {
	const [local, domain] = email.split('@');
	if (!local || !domain) return email;
	const masked = `${local.charAt(0)}***`;
	return `${masked}@${domain}`;
}

/**
 * Маскирует номер телефона, скрывая часть цифр.
 * Оставляет видимыми только последние 4 цифры и форматирует номер.
 * @param phone - Номер телефона для маскировки
 * @returns Замаскированный номер в формате '+7 *** XXX-XX-XX'
 * @example
 * maskPhone('+79991234567') // '+7 *** 123-45-67'
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
 * Нормализует пробелы в строке: заменяет множественные пробелы на один и удаляет пробелы в начале и конце.
 * @param text - Исходная строка
 * @returns Строка с нормализованными пробелами
 * @example
 * normalizeSpaces('  Hello    World  ') // 'Hello World'
 */
export function normalizeSpaces(text: string): string {
	return text.replace(/\s+/g, ' ').trim();
}

/**
 * Проверяет, содержит ли строка только буквы (латинские и кириллические).
 * @param text - Строка для проверки
 * @returns `true`, если строка содержит только буквы, иначе `false`
 * @example
 * isAlpha('Hello') // true
 * isAlpha('Привет') // true
 * isAlpha('Hello123') // false
 */
export function isAlpha(text: string): boolean {
	return /^[a-zA-Zа-яА-ЯёЁ]+$/.test(text);
}

/**
 * Проверяет, содержит ли строка только буквы и цифры (латинские и кириллические).
 * @param text - Строка для проверки
 * @returns `true`, если строка содержит только буквы и цифры, иначе `false`
 * @example
 * isAlphanumeric('Hello123') // true
 * isAlphanumeric('Привет123') // true
 * isAlphanumeric('Hello 123') // false (содержит пробел)
 */
export function isAlphanumeric(text: string): boolean {
	return /^[a-zA-Zа-яА-ЯёЁ0-9]+$/.test(text);
}

/**
 * Форматирует число, добавляя пробелы как разделители тысяч.
 * Использует русский формат: пробел каждые 3 цифры справа налево.
 * @param n - Число для форматирования
 * @returns Отформатированная строка с разделителями тысяч
 * @example
 * formatNumber(1234567) // '1 234 567'
 * formatNumber(1000) // '1 000'
 */
export function formatNumber(n: number): string {
	return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Форматирует число как процент с указанным количеством знаков после запятой.
 * Умножает число на 100 и добавляет символ %.
 * @param n - Число в диапазоне 0-1 (например, 0.15 для 15%)
 * @param decimals - Количество знаков после запятой, по умолчанию 2
 * @returns Отформатированная строка процента
 * @example
 * formatPercent(0.1567) // '15.67%'
 * formatPercent(0.5, 0) // '50%'
 */
export function formatPercent(n: number, decimals = 2): string {
	return `${(n * 100).toFixed(decimals)}%`;
}

/**
 * Генерирует случайную строку указанной длины из указанных символов.
 * @param length - Длина генерируемой строки
 * @param charset - Набор символов для использования. По умолчанию: латиница (заглавные и строчные) и цифры
 * @returns Случайная строка
 * @example
 * randomString(8) // 'aB3dEfGh'
 * randomString(6, '0123456789') // '123456'
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
 * Подсчитывает количество слов в тексте.
 * Словом считается последовательность непробельных символов, разделенная пробелами.
 * @param text - Исходный текст
 * @returns Количество слов в тексте
 * @example
 * wordCount('Hello World') // 2
 * wordCount('  Привет  Мир  ') // 2
 */
export function wordCount(text: string): number {
	return text
		.trim()
		.split(/\s+/)
		.filter((word) => word.length > 0).length;
}

/**
 * Транслитерирует кириллические символы в латинские согласно стандартной таблице соответствия.
 * Заглавные буквы остаются заглавными, строчные - строчными.
 * @param text - Исходный текст, который может содержать кириллицу
 * @returns Текст с транслитерированными символами
 * @example
 * transliterate('Привет') // 'Privet'
 * transliterate('Москва') // 'Moskva'
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
