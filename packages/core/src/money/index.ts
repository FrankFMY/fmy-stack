/**
 * @fileoverview FMY Stack
 * @author Artem Prianishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2026 Artem Prianishnikov
 * @license Apache-2.0
 *
 * Утилиты для работы с деньгами и финансами
 */

/**
 * Поддерживаемые валюты в системе.
 * Используются для форматирования денежных сумм и конвертаций.
 */
export const Currency = {
	RUB: 'RUB',
	USD: 'USD',
	EUR: 'EUR',
	GBP: 'GBP',
	CNY: 'CNY'
} as const;

/**
 * Тип валюты - одно из значений Currency.
 */
export type Currency = (typeof Currency)[keyof typeof Currency];

/**
 * Символы валют для форматирования.
 * Сопоставляет код валюты с её символом.
 */
const CURRENCY_SYMBOLS: Record<Currency, string> = {
	RUB: '₽',
	USD: '$',
	EUR: '€',
	GBP: '£',
	CNY: '¥'
};

/**
 * Стандартные ставки НДС (в процентах).
 * Используются для расчета налогов в различных странах.
 */
export const VATRate = {
	STANDARD: 20,
	REDUCED: 10,
	ZERO: 0
} as const;

/**
 * Тип ставки НДС - одно из значений VATRate.
 */
export type VATRate = (typeof VATRate)[keyof typeof VATRate];

/**
 * Форматирует денежную сумму с разделителями тысяч и символом валюты.
 * Использует стандартные разделители: пробел для тысяч, точка для дробной части.
 * @param amount - Сумма для форматирования
 * @param currency - Код валюты из Currency (по умолчанию RUB)
 * @returns Отформатированная строка с символом валюты
 * @example
 * formatMoney(1234.56) // "1 234.56 ₽"
 * formatMoney(1234.56, 'USD') // "1 234.56 $"
 */
export function formatMoney(amount: number, currency: Currency = 'RUB'): string {
	const formatted = formatNumber(amount);
	const symbol = CURRENCY_SYMBOLS[currency];
	return `${formatted} ${symbol}`;
}

/**
 * Форматирует денежную сумму в российском формате.
 * Использует запятую как разделитель дробной части и пробел как разделитель тысяч.
 * @param amount - Сумма для форматирования
 * @returns Отформатированная строка в формате "X XXX,XX ₽"
 * @example
 * formatMoneyRU(1234567.89) // "1 234 567,89 ₽"
 */
export function formatMoneyRU(amount: number): string {
	const [intPart, decPart] = amount.toFixed(2).split('.');
	const formattedInt = intPart!.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
	return `${formattedInt},${decPart} ₽`;
}

/**
 * Форматирует денежную сумму в кратком формате (K, M, B).
 * Удобно для отображения больших сумм в компактном виде.
 * @param amount - Сумма для форматирования
 * @param currency - Код валюты из Currency (по умолчанию RUB)
 * @returns Краткая форма суммы (например, "1.5M ₽", "2.3K $")
 * @example
 * formatMoneyShort(1500000) // "1.5M ₽"
 * formatMoneyShort(1500) // "1.5K ₽"
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
	return Number.isNaN(result) ? 0 : result;
}

/**
 * Округлить сумму до копеек
 */
export function roundMoney(amount: number): number {
	return Math.round(amount * 100) / 100;
}

/**
 * Рассчитывает НДС от общей суммы (включенный НДС).
 * Разбирает сумму с НДС на чистую сумму, сумму НДС и общую сумму.
 * @param amount - Сумма с включенным НДС
 * @param rate - Ставка НДС в процентах (по умолчанию VATRate.STANDARD = 20)
 * @returns Объект с разбором суммы: { net: чистая сумма, vat: сумма НДС, gross: общая сумма }
 * @example
 * calcVAT(1000, 20) // { net: 833.33, vat: 166.67, gross: 1000 }
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
 * Добавляет НДС к чистой сумме.
 * Рассчитывает сумму НДС и общую сумму с НДС.
 * @param amount - Чистая сумма без НДС
 * @param rate - Ставка НДС в процентах (по умолчанию VATRate.STANDARD = 20)
 * @returns Объект с расчетом: { net: чистая сумма, vat: сумма НДС, gross: общая сумма }
 * @example
 * addVAT(1000, 20) // { net: 1000, vat: 200, gross: 1200 }
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
 * Рассчитывает скидку от цены.
 * Вычисляет сумму скидки и итоговую цену после применения скидки.
 * @param price - Исходная цена
 * @param discountPercent - Процент скидки (0-100)
 * @returns Объект с расчетом скидки: { original: исходная цена, discount: сумма скидки, final: итоговая цена }
 * @example
 * calcDiscount(1000, 15) // { original: 1000, discount: 150, final: 850 }
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
 * Вычисляет процент скидки по исходной и итоговой цене.
 * @param originalPrice - Исходная цена
 * @param finalPrice - Цена после скидки
 * @returns Процент скидки (0-100). Возвращает 0 если originalPrice = 0
 * @example
 * calcDiscountPercent(1000, 850) // 15
 * calcDiscountPercent(200, 180) // 10
 */
export function calcDiscountPercent(originalPrice: number, finalPrice: number): number {
	if (originalPrice === 0) return 0;
	return Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
}

/**
 * Маскирует номер банковской карты, показывая только последние 4 цифры.
 * Заменяет все цифры кроме последних 4 на звездочки.
 * @param number - Номер карты (может содержать пробелы и другие символы)
 * @returns Замаскированный номер вида "•••• XXXX"
 * @example
 * formatCreditCard("4111111111111111") // "•••• 1111"
 * formatCreditCard("4111 1111 1111 1111") // "•••• 1111"
 */
export function formatCreditCard(number: string): string {
	const cleaned = number.replace(/\D/g, '');
	if (cleaned.length < 4) return '••••';
	const lastFour = cleaned.slice(-4);
	return `•••• ${lastFour}`;
}

/**
 * Форматирует полный номер банковской карты с пробелами.
 * Группирует цифры по 4, добавляя пробелы между группами.
 * @param number - Номер карты (может содержать пробелы и другие символы)
 * @returns Форматированный номер вида "XXXX XXXX XXXX XXXX"
 * @example
 * formatCreditCardFull("4111111111111111") // "4111 1111 1111 1111"
 */
export function formatCreditCardFull(number: string): string {
	const cleaned = number.replace(/\D/g, '');
	return cleaned.match(/.{1,4}/g)?.join(' ') ?? '';
}

/**
 * Проверяет валидность IBAN (International Bank Account Number).
 * Реализует алгоритм проверки IBAN согласно стандарту ISO 13616.
 * @param iban - IBAN для проверки (может содержать пробелы)
 * @returns `true` если IBAN валиден, иначе `false`
 * @example
 * validateIBAN("GB29 NWBK 6016 1331 9268 19") // true
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
