/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * Утилиты для работы с телефонными номерами
 */

/**
 * Очистить номер телефона от форматирования
 * @example cleanPhone('+7 (999) 123-45-67') // '+79991234567'
 */
export function cleanPhone(phone: string): string {
	const cleaned = phone.replace(/\D/g, '');

	// Если начинается с 8, заменяем на 7
	if (cleaned.startsWith('8') && cleaned.length === 11) {
		return `+7${cleaned.slice(1)}`;
	}

	// Если начинается с 7
	if (cleaned.startsWith('7') && cleaned.length === 11) {
		return `+${cleaned}`;
	}

	// Если 10 цифр (без кода страны)
	if (cleaned.length === 10) {
		return `+7${cleaned}`;
	}

	return `+${cleaned}`;
}

/**
 * Форматировать телефон в российском формате
 * @example formatPhoneRU('+79991234567') // '+7 (999) 123-45-67'
 */
export function formatPhoneRU(phone: string): string {
	const cleaned = phone.replace(/\D/g, '');

	// Убеждаемся, что у нас есть 11 цифр (включая код страны)
	let normalized = cleaned;
	if (cleaned.length === 10) {
		normalized = `7${cleaned}`;
	} else if (cleaned.startsWith('8') && cleaned.length === 11) {
		normalized = `7${cleaned.slice(1)}`;
	}

	if (normalized.length !== 11 || !normalized.startsWith('7')) {
		return phone; // Возвращаем как есть, если формат неизвестен
	}

	const code = normalized.slice(1, 4);
	const part1 = normalized.slice(4, 7);
	const part2 = normalized.slice(7, 9);
	const part3 = normalized.slice(9, 11);

	return `+7 (${code}) ${part1}-${part2}-${part3}`;
}

/**
 * Форматировать телефон компактно
 * @example formatPhoneCompact('+79991234567') // '+7 999 123-45-67'
 */
export function formatPhoneCompact(phone: string): string {
	const cleaned = phone.replace(/\D/g, '');

	let normalized = cleaned;
	if (cleaned.length === 10) {
		normalized = `7${cleaned}`;
	} else if (cleaned.startsWith('8') && cleaned.length === 11) {
		normalized = `7${cleaned.slice(1)}`;
	}

	if (normalized.length !== 11 || !normalized.startsWith('7')) {
		return phone;
	}

	const code = normalized.slice(1, 4);
	const part1 = normalized.slice(4, 7);
	const part2 = normalized.slice(7, 9);
	const part3 = normalized.slice(9, 11);

	return `+7 ${code} ${part1}-${part2}-${part3}`;
}

/**
 * Парсить телефон на составляющие
 */
export function parsePhone(phone: string): {
	country: string;
	area: string;
	number: string;
	isValid: boolean;
} {
	const cleaned = phone.replace(/\D/g, '');

	let normalized = cleaned;
	if (cleaned.length === 10) {
		normalized = `7${cleaned}`;
	} else if (cleaned.startsWith('8') && cleaned.length === 11) {
		normalized = `7${cleaned.slice(1)}`;
	}

	const isValid = normalized.length === 11 && normalized.startsWith('7');

	if (!isValid) {
		return {
			country: '',
			area: '',
			number: cleaned,
			isValid: false
		};
	}

	return {
		country: '+7',
		area: normalized.slice(1, 4),
		number: normalized.slice(4),
		isValid: true
	};
}

/**
 * Проверяет валидность российского номера телефона.
 * Российские мобильные номера должны начинаться с 9 и иметь правильную длину.
 * @param phone - Номер телефона для проверки
 * @returns `true` если номер валиден, иначе `false`
 * @example
 * validatePhoneRU('+79991234567') // true
 * validatePhoneRU('89991234567') // true
 * validatePhoneRU('+74991234567') // false (городской номер)
 * validatePhoneRU('invalid') // false
 */
export function validatePhoneRU(phone: string): boolean {
	const cleaned = phone.replace(/\D/g, '');

	// 10 цифр (без кода страны)
	if (cleaned.length === 10) {
		return /^9\d{9}$/.test(cleaned); // Мобильные начинаются с 9
	}

	// 11 цифр (с кодом страны)
	if (cleaned.length === 11) {
		// Код страны 7 или 8
		if (cleaned.startsWith('7') || cleaned.startsWith('8')) {
			return /^[78]9\d{9}$/.test(cleaned);
		}
	}

	return false;
}

/**
 * Определить оператора по номеру телефона (упрощенно)
 */
export function getOperator(phone: string): string | null {
	const cleaned = phone.replace(/\D/g, '');

	let code: string;
	if (cleaned.length === 10) {
		code = cleaned.slice(0, 3);
	} else if (cleaned.length === 11) {
		code = cleaned.slice(1, 4);
	} else {
		return null;
	}

	// Упрощенное определение оператора по DEF-коду
	const operatorMap: Record<string, string[]> = {
		МТС: [
			'910',
			'911',
			'912',
			'913',
			'914',
			'915',
			'916',
			'917',
			'918',
			'919',
			'980',
			'981',
			'982',
			'983',
			'984',
			'985',
			'986',
			'987',
			'988',
			'989'
		],
		Билайн: [
			'903',
			'905',
			'906',
			'909',
			'960',
			'961',
			'962',
			'963',
			'964',
			'965',
			'966',
			'967',
			'968',
			'969'
		],
		МегаФон: [
			'920',
			'921',
			'922',
			'923',
			'924',
			'925',
			'926',
			'927',
			'928',
			'929',
			'930',
			'931',
			'932',
			'933',
			'934',
			'936',
			'937',
			'938',
			'939'
		],
		Теле2: [
			'900',
			'901',
			'902',
			'904',
			'908',
			'950',
			'951',
			'952',
			'953',
			'958',
			'991',
			'992',
			'993',
			'994',
			'995',
			'996',
			'999'
		]
	};

	for (const [operator, codes] of Object.entries(operatorMap)) {
		if (codes.includes(code)) {
			return operator;
		}
	}

	return null;
}

/**
 * Создать ссылку для звонка
 */
export function createPhoneLink(phone: string): string {
	const cleaned = cleanPhone(phone);
	return `tel:${cleaned}`;
}

/**
 * Создать ссылку для WhatsApp
 */
export function createWhatsAppLink(phone: string, message?: string): string {
	const cleaned = cleanPhone(phone).replace('+', '');
	const url = `https://wa.me/${cleaned}`;
	return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}

/**
 * Создать ссылку для Telegram
 */
export function createTelegramLink(phone: string): string {
	const cleaned = cleanPhone(phone).replace('+', '');
	return `https://t.me/+${cleaned}`;
}

/**
 * Маскировать номер телефона
 * @example maskPhoneNumber('+79991234567') // '+7 (***) ***-45-67'
 */
export function maskPhoneNumber(phone: string): string {
	const cleaned = phone.replace(/\D/g, '');

	let normalized = cleaned;
	if (cleaned.length === 10) {
		normalized = `7${cleaned}`;
	} else if (cleaned.startsWith('8') && cleaned.length === 11) {
		normalized = `7${cleaned.slice(1)}`;
	}

	if (normalized.length !== 11 || !normalized.startsWith('7')) {
		return phone;
	}

	const part2 = normalized.slice(7, 9);
	const part3 = normalized.slice(9, 11);

	return `+7 (***) ***-${part2}-${part3}`;
}
