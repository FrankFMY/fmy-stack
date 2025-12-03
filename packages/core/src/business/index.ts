/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * Утилиты для работы с российскими бизнес-идентификаторами (ИНН, ОГРН, КПП, СНИЛС)
 */

/**
 * Проверить валидность ИНН (Идентификационный номер налогоплательщика)
 * ИНН юрлица: 10 цифр, ИНН физлица: 12 цифр
 */
export function validateINN(inn: string): boolean {
	const cleaned = inn.replace(/\D/g, '');

	if (cleaned.length === 10) {
		return validateINN10(cleaned);
	}

	if (cleaned.length === 12) {
		return validateINN12(cleaned);
	}

	return false;
}

/**
 * Проверить ИНН юридического лица (10 цифр)
 */
function validateINN10(inn: string): boolean {
	const weights = [2, 4, 10, 3, 5, 9, 4, 6, 8];
	const digits = inn.split('').map(Number);

	let sum = 0;
	for (let i = 0; i < 9; i++) {
		sum += digits[i]! * weights[i]!;
	}

	const checkDigit = (sum % 11) % 10;
	return checkDigit === digits[9];
}

/**
 * Проверить ИНН физического лица (12 цифр)
 */
function validateINN12(inn: string): boolean {
	const weights1 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
	const weights2 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
	const digits = inn.split('').map(Number);

	// Проверка 11-й цифры
	let sum1 = 0;
	for (let i = 0; i < 10; i++) {
		sum1 += digits[i]! * weights1[i]!;
	}
	const checkDigit1 = (sum1 % 11) % 10;
	if (checkDigit1 !== digits[10]) return false;

	// Проверка 12-й цифры
	let sum2 = 0;
	for (let i = 0; i < 11; i++) {
		sum2 += digits[i]! * weights2[i]!;
	}
	const checkDigit2 = (sum2 % 11) % 10;
	return checkDigit2 === digits[11];
}

/**
 * Проверить валидность ОГРН (Основной государственный регистрационный номер)
 * ОГРН юрлица: 13 цифр, ОГРНИП: 15 цифр
 */
export function validateOGRN(ogrn: string): boolean {
	const cleaned = ogrn.replace(/\D/g, '');

	if (cleaned.length === 13) {
		return validateOGRN13(cleaned);
	}

	if (cleaned.length === 15) {
		return validateOGRN15(cleaned);
	}

	return false;
}

/**
 * Проверить ОГРН юридического лица (13 цифр)
 */
function validateOGRN13(ogrn: string): boolean {
	const number = BigInt(ogrn.slice(0, 12));
	const remainder = Number(number % 11n) % 10;
	return remainder === parseInt(ogrn[12]!, 10);
}

/**
 * Проверить ОГРНИП (15 цифр)
 */
function validateOGRN15(ogrn: string): boolean {
	const number = BigInt(ogrn.slice(0, 14));
	const remainder = Number(number % 13n) % 10;
	return remainder === parseInt(ogrn[14]!, 10);
}

/**
 * Проверить валидность КПП (Код причины постановки на учет)
 * КПП: 9 цифр
 */
export function validateKPP(kpp: string): boolean {
	const cleaned = kpp.replace(/\D/g, '');

	if (cleaned.length !== 9) {
		return false;
	}

	// Первые 4 цифры - код налогового органа (должны быть числами)
	// 5-6 цифры - причина постановки на учёт
	// 7-9 цифры - порядковый номер

	// Проверяем, что первые 2 цифры - валидный код региона (01-99)
	const regionCode = parseInt(cleaned.slice(0, 2), 10);
	if (regionCode < 1 || regionCode > 99) {
		return false;
	}

	return /^\d{9}$/.test(cleaned);
}

/**
 * Проверить валидность СНИЛС (Страховой номер индивидуального лицевого счёта)
 * СНИЛС: 11 цифр в формате XXX-XXX-XXX YY
 */
export function validateSNILS(snils: string): boolean {
	const cleaned = snils.replace(/\D/g, '');

	if (cleaned.length !== 11) {
		return false;
	}

	const number = cleaned.slice(0, 9);
	const checksum = parseInt(cleaned.slice(9), 10);

	// Для номеров меньше 001-001-998 контрольное число не проверяется
	if (parseInt(number, 10) <= 1001998) {
		return true;
	}

	const digits = number.split('').map(Number);
	let sum = 0;

	for (let i = 0; i < 9; i++) {
		sum += digits[i]! * (9 - i);
	}

	let calculatedChecksum: number;
	if (sum < 100) {
		calculatedChecksum = sum;
	} else if (sum === 100 || sum === 101) {
		calculatedChecksum = 0;
	} else {
		calculatedChecksum = sum % 101;
		if (calculatedChecksum === 100) {
			calculatedChecksum = 0;
		}
	}

	return calculatedChecksum === checksum;
}

/**
 * Форматировать ИНН
 * @example formatINN('7707083893') // '7707083893'
 */
export function formatINN(inn: string): string {
	return inn.replace(/\D/g, '');
}

/**
 * Форматировать СНИЛС
 * @example formatSNILS('12345678901') // '123-456-789 01'
 */
export function formatSNILS(snils: string): string {
	const cleaned = snils.replace(/\D/g, '');
	if (cleaned.length !== 11) return snils;

	return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
}

/**
 * Форматировать ОГРН
 */
export function formatOGRN(ogrn: string): string {
	return ogrn.replace(/\D/g, '');
}

/**
 * Форматировать КПП
 */
export function formatKPP(kpp: string): string {
	return kpp.replace(/\D/g, '');
}

/**
 * Генерировать случайный ИНН для юрлица (10 цифр) - для тестов
 */
export function generateINN10(): string {
	const weights = [2, 4, 10, 3, 5, 9, 4, 6, 8];

	// Генерируем первые 9 цифр
	const digits: number[] = [];
	for (let i = 0; i < 9; i++) {
		digits.push(Math.floor(Math.random() * 10));
	}

	// Вычисляем контрольную цифру
	let sum = 0;
	for (let i = 0; i < 9; i++) {
		sum += digits[i]! * weights[i]!;
	}
	const checkDigit = (sum % 11) % 10;
	digits.push(checkDigit);

	return digits.join('');
}

/**
 * Генерировать случайный ИНН для физлица (12 цифр) - для тестов
 */
export function generateINN12(): string {
	const weights1 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
	const weights2 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];

	// Генерируем первые 10 цифр
	const digits: number[] = [];
	for (let i = 0; i < 10; i++) {
		digits.push(Math.floor(Math.random() * 10));
	}

	// Вычисляем 11-ю цифру
	let sum1 = 0;
	for (let i = 0; i < 10; i++) {
		sum1 += digits[i]! * weights1[i]!;
	}
	const checkDigit1 = (sum1 % 11) % 10;
	digits.push(checkDigit1);

	// Вычисляем 12-ю цифру
	let sum2 = 0;
	for (let i = 0; i < 11; i++) {
		sum2 += digits[i]! * weights2[i]!;
	}
	const checkDigit2 = (sum2 % 11) % 10;
	digits.push(checkDigit2);

	return digits.join('');
}

/**
 * Определить тип ИНН
 */
export function getINNType(inn: string): 'legal' | 'individual' | 'unknown' {
	const cleaned = inn.replace(/\D/g, '');

	if (cleaned.length === 10 && validateINN10(cleaned)) {
		return 'legal';
	}

	if (cleaned.length === 12 && validateINN12(cleaned)) {
		return 'individual';
	}

	return 'unknown';
}

/**
 * Определить тип ОГРН
 */
export function getOGRNType(ogrn: string): 'legal' | 'individual' | 'unknown' {
	const cleaned = ogrn.replace(/\D/g, '');

	if (cleaned.length === 13 && validateOGRN13(cleaned)) {
		return 'legal';
	}

	if (cleaned.length === 15 && validateOGRN15(cleaned)) {
		return 'individual';
	}

	return 'unknown';
}

/**
 * Проверить валидность БИК (Банковский идентификационный код)
 * БИК: 9 цифр
 */
export function validateBIK(bik: string): boolean {
	const cleaned = bik.replace(/\D/g, '');

	if (cleaned.length !== 9) {
		return false;
	}

	// Первые 2 цифры должны быть 04 (код РФ)
	if (!cleaned.startsWith('04')) {
		return false;
	}

	return /^\d{9}$/.test(cleaned);
}

/**
 * Проверить валидность расчётного счёта
 */
export function validateAccount(account: string, bik: string): boolean {
	const cleanedAccount = account.replace(/\D/g, '');
	const cleanedBik = bik.replace(/\D/g, '');

	if (cleanedAccount.length !== 20 || cleanedBik.length !== 9) {
		return false;
	}

	// Формируем строку для проверки: последние 3 цифры БИК + номер счета
	const controlString = cleanedBik.slice(6) + cleanedAccount;
	const weights = [7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1];

	let sum = 0;
	for (let i = 0; i < 23; i++) {
		sum += (parseInt(controlString[i]!, 10) * weights[i]!) % 10;
	}

	return sum % 10 === 0;
}

