/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * Утилиты для работы с деньгами и финансами
 */

/**
 * Валюты
 */
export const Currency = {
	RUB: 'RUB',
	USD: 'USD',
	EUR: 'EUR',
	GBP: 'GBP',
	CNY: 'CNY'
} as const;

export type Currency = (typeof Currency)[keyof typeof Currency];

/**
 * Символы валют
 */
const CURRENCY_SYMBOLS: Record<Currency, string> = {
	RUB: '₽',
	USD: '$',
	EUR: '€',
	GBP: '£',
	CNY: '¥'
};

/**
 * Ставки НДС
 */
export const VATRate = {
	STANDARD: 20,
	REDUCED: 10,
	ZERO: 0
} as const;

export type VATRate = (typeof VATRate)[keyof typeof VATRate];

/**
 * Форматировать сумму денег
 * @example formatMoney(1234.56) // "1 234.56 ₽"
 * @example formatMoney(1234.56, 'USD') // "1 234.56 $"
 */
export function formatMoney(amount: number, currency: Currency = 'RUB'): string {
	const formatted = formatNumber(amount);
	const symbol = CURRENCY_SYMBOLS[currency];
	return `${formatted} ${symbol}`;
}

/**
 * Форматировать сумму денег в русском формате
 * @example formatMoneyRU(1234567.89) // "1 234 567,89 ₽"
 */
export function formatMoneyRU(amount: number): string {
	const [intPart, decPart] = amount.toFixed(2).split('.');
	const formattedInt = intPart!.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
	return `${formattedInt},${decPart} ₽`;
}

/**
 * Форматировать сумму денег кратко
 * @example formatMoneyShort(1500000) // "1.5M ₽"
 * @example formatMoneyShort(1500) // "1.5K ₽"
 */
export function formatMoneyShort(amount: number, currency: Currency = 'RUB'): string {
	const symbol = CURRENCY_SYMBOLS[currency];

	if (amount >= 1_000_000_000) {
		return `${(amount / 1_000_000_000).toFixed(1).replace('.0', '')}B ${symbol}`;
	}
	if (amount >= 1_000_000) {
		return `${(amount / 1_000_000).toFixed(1).replace('.0', '')}M ${symbol}`;
	}
	if (amount >= 1_000) {
		return `${(amount / 1_000).toFixed(1).replace('.0', '')}K ${symbol}`;
	}
	return `${amount} ${symbol}`;
}

/**
 * Парсить строку с деньгами в число
 * @example parseMoney("1 234,56 ₽") // 1234.56
 * @example parseMoney("$1,234.56") // 1234.56
 */
export function parseMoney(text: string): number {
	// Удаляем все символы кроме цифр, точки и запятой
	const cleaned = text.replace(/[^\d.,]/g, '');

	// Определяем разделитель дробной части
	const lastDot = cleaned.lastIndexOf('.');
	const lastComma = cleaned.lastIndexOf(',');

	let normalized: string;

	if (lastComma > lastDot) {
		// Запятая - разделитель дробной части (1 234,56)
		normalized = cleaned.replace(/\./g, '').replace(',', '.');
	} else {
		// Точка - разделитель дробной части (1,234.56)
		normalized = cleaned.replace(/,/g, '');
	}

	const result = parseFloat(normalized);
	return isNaN(result) ? 0 : result;
}

/**
 * Округлить сумму до копеек
 */
export function roundMoney(amount: number): number {
	return Math.round(amount * 100) / 100;
}

/**
 * Рассчитать НДС
 * @example calcVAT(1000, 20) // { net: 833.33, vat: 166.67, gross: 1000 }
 */
export function calcVAT(
	amount: number,
	rate: number = VATRate.STANDARD
): {
	net: number;
	vat: number;
	gross: number;
} {
	const gross = roundMoney(amount);
	const net = roundMoney(gross / (1 + rate / 100));
	const vat = roundMoney(gross - net);

	return { net, vat, gross };
}

/**
 * Добавить НДС к сумме
 * @example addVAT(1000, 20) // { net: 1000, vat: 200, gross: 1200 }
 */
export function addVAT(
	amount: number,
	rate: number = VATRate.STANDARD
): {
	net: number;
	vat: number;
	gross: number;
} {
	const net = roundMoney(amount);
	const vat = roundMoney(net * (rate / 100));
	const gross = roundMoney(net + vat);

	return { net, vat, gross };
}

/**
 * Рассчитать скидку
 * @example calcDiscount(1000, 15) // { original: 1000, discount: 150, final: 850 }
 */
export function calcDiscount(
	price: number,
	discountPercent: number
): {
	original: number;
	discount: number;
	final: number;
} {
	const original = roundMoney(price);
	const discount = roundMoney(original * (discountPercent / 100));
	const final = roundMoney(original - discount);

	return { original, discount, final };
}

/**
 * Рассчитать процент скидки
 * @example calcDiscountPercent(1000, 850) // 15
 */
export function calcDiscountPercent(originalPrice: number, finalPrice: number): number {
	if (originalPrice === 0) return 0;
	return Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
}

/**
 * Маскировать номер карты
 * @example formatCreditCard("4111111111111111") // "•••• 1111"
 */
export function formatCreditCard(number: string): string {
	const cleaned = number.replace(/\D/g, '');
	if (cleaned.length < 4) return '••••';
	const lastFour = cleaned.slice(-4);
	return `•••• ${lastFour}`;
}

/**
 * Форматировать номер карты с пробелами
 * @example formatCreditCardFull("4111111111111111") // "4111 1111 1111 1111"
 */
export function formatCreditCardFull(number: string): string {
	const cleaned = number.replace(/\D/g, '');
	return cleaned.match(/.{1,4}/g)?.join(' ') ?? '';
}

/**
 * Проверить валидность IBAN
 */
export function validateIBAN(iban: string): boolean {
	const cleaned = iban.replace(/\s/g, '').toUpperCase();

	// Проверяем длину (минимум 15, максимум 34)
	if (cleaned.length < 15 || cleaned.length > 34) {
		return false;
	}

	// Проверяем формат: 2 буквы + 2 цифры + остальное
	if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(cleaned)) {
		return false;
	}

	// Перемещаем первые 4 символа в конец
	const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);

	// Конвертируем буквы в числа (A=10, B=11, ...)
	const numericString = rearranged.replace(/[A-Z]/g, (char) => String(char.charCodeAt(0) - 55));

	// Проверяем по модулю 97
	return mod97(numericString) === 1;
}

// === Вспомогательные функции ===

function formatNumber(n: number): string {
	const [intPart, decPart] = n.toFixed(2).split('.');
	const formattedInt = intPart!.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
	return `${formattedInt}.${decPart}`;
}

function mod97(numericString: string): number {
	let remainder = 0;
	for (const char of numericString) {
		remainder = (remainder * 10 + parseInt(char, 10)) % 97;
	}
	return remainder;
}

