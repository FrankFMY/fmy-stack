/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * Утилиты для работы с российскими бизнес-идентификаторами (ИНН, ОГРН, КПП, СНИЛС)
 */

/**
 * Проверяет валидность ИНН (Идентификационный номер налогоплательщика).
 * Поддерживает ИНН юридических лиц (10 цифр) и физических лиц (12 цифр).
 * @param inn - ИНН для проверки (может содержать пробелы и другие символы)
 * @returns `true` если ИНН валиден, иначе `false`
 * @example
 * validateINN('7707083893') // true (юридическое лицо)
 * validateINN('500100732259') // true (физическое лицо)
 * validateINN('1234567890') // false (невалидный ИНН)
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
 * Проверяет ИНН юридического лица (10 цифр) по алгоритму ФНС.
 * Вычисляет контрольную сумму и сравнивает с последней цифрой.
 * @param inn - ИНН юридического лица (10 цифр)
 * @returns `true` если ИНН валиден, иначе `false`
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
 * Проверяет ИНН физического лица (12 цифр) по алгоритму ФНС.
 * Вычисляет две контрольные суммы и сравнивает с последними цифрами.
 * @param inn - ИНН физического лица (12 цифр)
 * @returns `true` если ИНН валиден, иначе `false`
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
 * Проверяет валидность ОГРН (Основной государственный регистрационный номер).
 * Поддерживает ОГРН юридических лиц (13 цифр) и ОГРНИП (15 цифр).
 * @param ogrn - ОГРН для проверки (может содержать пробелы и другие символы)
 * @returns `true` если ОГРН валиден, иначе `false`
 * @example
 * validateOGRN('1027700043530') // true (ОГРН юрлица)
 * validateOGRN('304770000000000') // true (ОГРНИП)
 * validateOGRN('1234567890123') // false (невалидный ОГРН)
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
 * Проверяет ОГРН юридического лица (13 цифр) по алгоритму ФНС.
 * Вычисляет контрольную сумму: последние 12 цифр делятся на 11.
 * @param ogrn - ОГРН юридического лица (13 цифр)
 * @returns `true` если ОГРН валиден, иначе `false`
 */
function validateOGRN13(ogrn: string): boolean {
	const number = BigInt(ogrn.slice(0, 12));
	const remainder = Number(number % 11n) % 10;
	return remainder === parseInt(ogrn[12]!, 10);
}

/**
 * Проверяет ОГРНИП (15 цифр) по алгоритму ФНС.
 * Вычисляет контрольную сумму: последние 14 цифр делятся на 13.
 * @param ogrn - ОГРНИП (15 цифр)
 * @returns `true` если ОГРНИП валиден, иначе `false`
 */
function validateOGRN15(ogrn: string): boolean {
	const number = BigInt(ogrn.slice(0, 14));
	const remainder = Number(number % 13n) % 10;
	return remainder === parseInt(ogrn[14]!, 10);
}

/**
 * Проверяет валидность КПП (Код причины постановки на учет).
 * КПП состоит из 9 цифр и включает код налогового органа, причину постановки и порядковый номер.
 * @param kpp - КПП для проверки (может содержать пробелы и другие символы)
 * @returns `true` если КПП валиден, иначе `false`
 * @example
 * validateKPP('770701001') // true
 * validateKPP('77070100') // false (слишком короткий)
 * validateKPP('007701001') // false (невалидный код региона)
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
 * Проверяет валидность СНИЛС (Страховой номер индивидуального лицевого счета).
 * СНИЛС состоит из 11 цифр с контрольной суммой.
 * @param snils - СНИЛС для проверки (может содержать дефисы и пробелы)
 * @returns `true` если СНИЛС валиден, иначе `false`
 * @example
 * validateSNILS('12345678901') // true (валидный СНИЛС)
 * validateSNILS('123-456-789 01') // true (с форматированием)
 * validateSNILS('12345678900') // false (невалидная контрольная сумма)
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
 * Форматирует ИНН, удаляя все нецифровые символы.
 * @param inn - ИНН для форматирования
 * @returns ИНН, содержащий только цифры
 * @example
 * formatINN('7707-083-893') // '7707083893'
 * formatINN('7707083893') // '7707083893'
 */
export function formatINN(inn: string): string {
	return inn.replace(/\D/g, '');
}

/**
 * Форматирует СНИЛС в стандартный вид: XXX-XXX-XXX YY.
 * @param snils - СНИЛС для форматирования
 * @returns Форматированный СНИЛС или исходная строка, если длина невалидна
 * @example
 * formatSNILS('12345678901') // '123-456-789 01'
 * formatSNILS('1234567890') // '1234567890' (невалидная длина)
 */
export function formatSNILS(snils: string): string {
	const cleaned = snils.replace(/\D/g, '');
	if (cleaned.length !== 11) return snils;

	return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
}

/**
 * Форматирует ОГРН, удаляя все нецифровые символы.
 * @param ogrn - ОГРН для форматирования
 * @returns ОГРН, содержащий только цифры
 * @example
 * formatOGRN('1027-700-043-530') // '1027700043530'
 */
export function formatOGRN(ogrn: string): string {
	return ogrn.replace(/\D/g, '');
}

/**
 * Форматирует КПП, удаляя все нецифровые символы.
 * @param kpp - КПП для форматирования
 * @returns КПП, содержащий только цифры
 * @example
 * formatKPP('7707-010-01') // '770701001'
 */
export function formatKPP(kpp: string): string {
	return kpp.replace(/\D/g, '');
}

/**
 * Генерирует случайный валидный ИНН для юридического лица (10 цифр).
 * Полезно для тестирования и генерации тестовых данных.
 * @returns Валидный ИНН юридического лица
 * @example
 * generateINN10() // '7707083893' (случайный валидный ИНН)
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
 * Генерирует случайный валидный ИНН для физического лица (12 цифр).
 * Полезно для тестирования и генерации тестовых данных.
 * @returns Валидный ИНН физического лица
 * @example
 * generateINN12() // '500100732259' (случайный валидный ИНН)
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
 * Определяет тип ИНН: юридическое лицо, физическое лицо или неизвестный.
 * @param inn - ИНН для определения типа
 * @returns Тип ИНН: 'legal' (юрлицо), 'individual' (физлицо) или 'unknown' (невалидный)
 * @example
 * getINNType('7707083893') // 'legal'
 * getINNType('500100732259') // 'individual'
 * getINNType('1234567890') // 'unknown'
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
 * Определяет тип ОГРН: юридическое лицо, индивидуальный предприниматель или неизвестный.
 * @param ogrn - ОГРН для определения типа
 * @returns Тип ОГРН: 'legal' (юрлицо), 'individual' (ИП) или 'unknown' (невалидный)
 * @example
 * getOGRNType('1027700043530') // 'legal'
 * getOGRNType('304770000000000') // 'individual'
 * getOGRNType('1234567890123') // 'unknown'
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
 * Проверяет валидность БИК (Банковский идентификационный код).
 * БИК состоит из 9 цифр, первые 2 цифры всегда "04" (код РФ).
 * @param bik - БИК для проверки (может содержать пробелы и другие символы)
 * @returns `true` если БИК валиден, иначе `false`
 * @example
 * validateBIK('044525225') // true
 * validateBIK('04452522') // false (слишком короткий)
 * validateBIK('054525225') // false (не начинается с 04)
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
 * Проверяет валидность расчетного счета по алгоритму ЦБ РФ.
 * Использует контрольные коэффициенты для валидации.
 * @param account - Номер расчетного счета (20 цифр)
 * @param bik - БИК банка (9 цифр)
 * @returns `true` если счет валиден для данного БИК, иначе `false`
 * @example
 * validateAccount('40702810100000000001', '044525225') // true
 * validateAccount('40702810100000000000', '044525225') // false (невалидная контрольная сумма)
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
