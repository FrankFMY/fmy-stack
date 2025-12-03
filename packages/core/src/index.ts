/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * @frankfmy/core - Фундаментальные TypeScript утилиты
 */

// === Types ===
export * from './types/index.js';

// === Dates ===
export {
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
	getMoscowTime,
	isValidDate
} from './dates/index.js';

// === Money ===
export {
	Currency,
	VATRate,
	formatMoney,
	formatMoneyRU,
	formatMoneyShort,
	parseMoney,
	roundMoney,
	calcVAT,
	addVAT,
	calcDiscount,
	calcDiscountPercent,
	formatCreditCard,
	formatCreditCardFull,
	validateIBAN
} from './money/index.js';

// === Strings ===
export {
	pluralize,
	pluralizeWithNumber,
	capitalize,
	titleCase,
	slugify,
	truncate,
	stripHtml,
	escapeHtml,
	unescapeHtml,
	highlightText,
	extractEmails,
	extractUrls,
	maskEmail,
	maskPhone,
	normalizeSpaces,
	isAlpha,
	isAlphanumeric,
	formatNumber,
	formatPercent,
	randomString,
	wordCount,
	transliterate
} from './strings/index.js';

// === Phone ===
export {
	cleanPhone,
	formatPhoneRU,
	formatPhoneCompact,
	parsePhone,
	validatePhoneRU,
	getOperator,
	createPhoneLink,
	createWhatsAppLink,
	createTelegramLink,
	maskPhoneNumber
} from './phone/index.js';

// === Business (РФ) ===
export {
	validateINN,
	validateOGRN,
	validateKPP,
	validateSNILS,
	validateBIK,
	validateAccount,
	formatINN,
	formatOGRN,
	formatKPP,
	formatSNILS,
	generateINN10,
	generateINN12,
	getINNType,
	getOGRNType
} from './business/index.js';

// === Crypto ===
export {
	generateUUID,
	generateNanoid,
	generateToken,
	generateSecureRandom,
	hashSHA256,
	hashSHA512,
	hashPassword,
	verifyPassword,
	generateOTP,
	generateApiKey,
	generateRandomPassword,
	checkPasswordStrength,
	secureCompare,
	encodeBase64,
	decodeBase64,
	encodeBase64Url,
	decodeBase64Url
} from './crypto/index.js';

// === Arrays ===
export {
	unique,
	uniqueBy,
	shuffle,
	groupBy,
	groupByFn,
	sortBy,
	chunk,
	flatten,
	flattenDeep,
	difference,
	intersection,
	union,
	first,
	last,
	sample,
	sampleN,
	countBy,
	sum,
	average,
	median,
	min,
	max,
	minBy,
	maxBy,
	keyBy,
	range,
	isEmpty,
	isNotEmpty,
	compact,
	zip,
	partition
} from './arrays/index.js';

// === Functions ===
export {
	debounce,
	debounceImmediate,
	throttle,
	throttleWithTrailing,
	memoize,
	once,
	noop,
	identity,
	compose,
	pipe,
	sleep,
	retry
} from './functions/index.js';
