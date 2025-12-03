/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * @frankfmy/validation - ArkType схемы валидации
 */

import { type, scope } from 'arktype';
import {
	validateINN,
	validateOGRN,
	validateKPP,
	validateSNILS,
	validatePhoneRU,
	validateBIK
} from '@frankfmy/core';

// ============================================================================
// БАЗОВЫЕ СХЕМЫ
// ============================================================================

/**
 * Email адрес
 */
export const EmailSchema = type('string.email');
export type Email = typeof EmailSchema.infer;

/**
 * URL
 */
export const UrlSchema = type('string.url');
export type Url = typeof UrlSchema.infer;

/**
 * UUID v4
 */
export const UuidSchema = type('string.uuid.v4');
export type Uuid = typeof UuidSchema.infer;

/**
 * Непустая строка
 */
export const NonEmptyStringSchema = type('string >= 1');
export type NonEmptyString = typeof NonEmptyStringSchema.infer;

/**
 * Строка с минимальной длиной
 */
export const minLengthString = (min: number) => type(`string >= ${min}`);

/**
 * Строка с максимальной длиной
 */
export const maxLengthString = (max: number) => type(`string <= ${max}`);

/**
 * Строка с диапазоном длины
 * Использует нативный синтаксис ArkType для intersection constraints
 */
export const rangeLengthString = (min: number, max: number) =>
	type(`string >= ${min}`).and(`string <= ${max}`);

// ============================================================================
// РОССИЙСКИЕ ИДЕНТИФИКАТОРЫ
// ============================================================================

/**
 * Российский номер телефона (+7XXXXXXXXXX)
 */
export const PhoneRUSchema = type('string').narrow((value, ctx) => {
	const cleaned = value.replace(/\D/g, '');
	if (!validatePhoneRU(cleaned)) {
		return ctx.mustBe('валидный российский номер телефона');
	}
	return true;
});
export type PhoneRU = typeof PhoneRUSchema.infer;

/**
 * ИНН юридического лица (10 цифр)
 */
export const INN10Schema = type('string').narrow((value, ctx) => {
	const cleaned = value.replace(/\D/g, '');
	if (cleaned.length !== 10) {
		return ctx.mustBe('ИНН юридического лица (10 цифр)');
	}
	if (!validateINN(cleaned)) {
		return ctx.mustBe('валидный ИНН с правильной контрольной суммой');
	}
	return true;
});
export type INN10 = typeof INN10Schema.infer;

/**
 * ИНН физического лица (12 цифр)
 */
export const INN12Schema = type('string').narrow((value, ctx) => {
	const cleaned = value.replace(/\D/g, '');
	if (cleaned.length !== 12) {
		return ctx.mustBe('ИНН физического лица (12 цифр)');
	}
	if (!validateINN(cleaned)) {
		return ctx.mustBe('валидный ИНН с правильной контрольной суммой');
	}
	return true;
});
export type INN12 = typeof INN12Schema.infer;

/**
 * ИНН (10 или 12 цифр)
 */
export const INNSchema = type('string').narrow((value, ctx) => {
	const cleaned = value.replace(/\D/g, '');
	if (cleaned.length !== 10 && cleaned.length !== 12) {
		return ctx.mustBe('ИНН (10 или 12 цифр)');
	}
	if (!validateINN(cleaned)) {
		return ctx.mustBe('валидный ИНН с правильной контрольной суммой');
	}
	return true;
});
export type INN = typeof INNSchema.infer;

/**
 * ОГРН юридического лица (13 цифр)
 */
export const OGRN13Schema = type('string').narrow((value, ctx) => {
	const cleaned = value.replace(/\D/g, '');
	if (cleaned.length !== 13) {
		return ctx.mustBe('ОГРН юридического лица (13 цифр)');
	}
	if (!validateOGRN(cleaned)) {
		return ctx.mustBe('валидный ОГРН с правильной контрольной суммой');
	}
	return true;
});
export type OGRN13 = typeof OGRN13Schema.infer;

/**
 * ОГРНИП (15 цифр)
 */
export const OGRN15Schema = type('string').narrow((value, ctx) => {
	const cleaned = value.replace(/\D/g, '');
	if (cleaned.length !== 15) {
		return ctx.mustBe('ОГРНИП (15 цифр)');
	}
	if (!validateOGRN(cleaned)) {
		return ctx.mustBe('валидный ОГРНИП с правильной контрольной суммой');
	}
	return true;
});
export type OGRN15 = typeof OGRN15Schema.infer;

/**
 * ОГРН (13 или 15 цифр)
 */
export const OGRNSchema = type('string').narrow((value, ctx) => {
	const cleaned = value.replace(/\D/g, '');
	if (cleaned.length !== 13 && cleaned.length !== 15) {
		return ctx.mustBe('ОГРН (13 или 15 цифр)');
	}
	if (!validateOGRN(cleaned)) {
		return ctx.mustBe('валидный ОГРН с правильной контрольной суммой');
	}
	return true;
});
export type OGRN = typeof OGRNSchema.infer;

/**
 * КПП (9 цифр)
 */
export const KPPSchema = type('string').narrow((value, ctx) => {
	const cleaned = value.replace(/\D/g, '');
	if (!validateKPP(cleaned)) {
		return ctx.mustBe('валидный КПП (9 цифр)');
	}
	return true;
});
export type KPP = typeof KPPSchema.infer;

/**
 * СНИЛС (11 цифр)
 */
export const SNILSSchema = type('string').narrow((value, ctx) => {
	const cleaned = value.replace(/\D/g, '');
	if (!validateSNILS(cleaned)) {
		return ctx.mustBe('валидный СНИЛС с правильной контрольной суммой');
	}
	return true;
});
export type SNILS = typeof SNILSSchema.infer;

/**
 * БИК (9 цифр)
 */
export const BIKSchema = type('string').narrow((value, ctx) => {
	const cleaned = value.replace(/\D/g, '');
	if (!validateBIK(cleaned)) {
		return ctx.mustBe('валидный БИК (9 цифр, начинается с 04)');
	}
	return true;
});
export type BIK = typeof BIKSchema.infer;

/**
 * Паспорт РФ (серия и номер: XXXX XXXXXX)
 */
export const PassportRUSchema = type('string').narrow((value, ctx) => {
	const cleaned = value.replace(/\D/g, '');
	if (cleaned.length !== 10) {
		return ctx.mustBe('паспорт РФ (10 цифр: серия 4 + номер 6)');
	}
	return true;
});
export type PassportRU = typeof PassportRUSchema.infer;

// ============================================================================
// БИЗНЕС СХЕМЫ
// ============================================================================

/**
 * Денежная сумма (>= 0)
 */
export const MoneySchema = type('number >= 0');
export type Money = typeof MoneySchema.infer;

/**
 * Денежная сумма (> 0)
 */
export const PositiveMoneySchema = type('number > 0');
export type PositiveMoney = typeof PositiveMoneySchema.infer;

/**
 * Процент (0-100)
 */
export const PercentSchema = type('number').narrow((value, ctx) => {
	if (value < 0 || value > 100) {
		return ctx.mustBe('процент от 0 до 100');
	}
	return true;
});
export type Percent = typeof PercentSchema.infer;

/**
 * Бюджет тендера (>= 10000)
 */
export const TenderBudgetSchema = type('number >= 10000');
export type TenderBudget = typeof TenderBudgetSchema.infer;

/**
 * Рейтинг (1-5)
 */
export const RatingSchema = type('number').narrow((value, ctx) => {
	if (value < 1 || value > 5) {
		return ctx.mustBe('рейтинг от 1 до 5');
	}
	return true;
});
export type Rating = typeof RatingSchema.infer;

/**
 * Положительное целое число
 */
export const PositiveIntSchema = type('number.integer > 0');
export type PositiveInt = typeof PositiveIntSchema.infer;

/**
 * Неотрицательное целое число
 */
export const NonNegativeIntSchema = type('number.integer >= 0');
export type NonNegativeInt = typeof NonNegativeIntSchema.infer;

// ============================================================================
// АУТЕНТИФИКАЦИЯ
// ============================================================================

/**
 * Сильный пароль
 * - Минимум 8 символов
 * - Хотя бы одна заглавная буква
 * - Хотя бы одна строчная буква
 * - Хотя бы одна цифра
 * - Хотя бы один специальный символ
 */
export const PasswordStrongSchema = type('string').narrow((value, ctx) => {
	if (value.length < 8) {
		return ctx.mustBe('не менее 8 символов');
	}
	if (!/[A-Z]/.test(value)) {
		return ctx.mustBe('содержать хотя бы одну заглавную букву');
	}
	if (!/[a-z]/.test(value)) {
		return ctx.mustBe('содержать хотя бы одну строчную букву');
	}
	if (!/\d/.test(value)) {
		return ctx.mustBe('содержать хотя бы одну цифру');
	}
	if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) {
		return ctx.mustBe('содержать хотя бы один специальный символ');
	}
	return true;
});
export type PasswordStrong = typeof PasswordStrongSchema.infer;

/**
 * Простой пароль (минимум 6 символов)
 */
export const PasswordSimpleSchema = type('string >= 6');
export type PasswordSimple = typeof PasswordSimpleSchema.infer;

/**
 * Имя пользователя (2-50 символов, буквы, цифры, подчеркивания)
 */
export const UsernameSchema = type('string').narrow((value, ctx) => {
	if (value.length < 2 || value.length > 50) {
		return ctx.mustBe('от 2 до 50 символов');
	}
	if (!/^[a-zA-Z0-9_]+$/.test(value)) {
		return ctx.mustBe('содержать только латинские буквы, цифры и подчеркивания');
	}
	return true;
});
export type Username = typeof UsernameSchema.infer;

// ============================================================================
// СОСТАВНЫЕ СХЕМЫ ДЛЯ ФОРМ
// ============================================================================

/**
 * Схема имени (2-100 символов)
 */
const NameSchema = type('string').narrow((value, ctx) => {
	if (value.length < 2 || value.length > 100) {
		return ctx.mustBe('от 2 до 100 символов');
	}
	return true;
});

/**
 * Схема адреса (1-500 символов)
 */
const AddressSchema = type('string').narrow((value, ctx) => {
	if (value.length < 1 || value.length > 500) {
		return ctx.mustBe('от 1 до 500 символов');
	}
	return true;
});

/**
 * Схема создания пользователя
 */
export const UserCreateSchema = type({
	email: 'string.email',
	name: NameSchema,
	'phone?': PhoneRUSchema,
	password: PasswordStrongSchema
});
export type UserCreate = typeof UserCreateSchema.infer;

/**
 * Схема входа пользователя
 */
export const UserLoginSchema = type({
	email: 'string.email',
	password: 'string >= 1'
});
export type UserLogin = typeof UserLoginSchema.infer;

/**
 * Схема обновления профиля
 */
export const UserUpdateSchema = type({
	'name?': NameSchema,
	'phone?': PhoneRUSchema,
	'avatar?': 'string.url'
});
export type UserUpdate = typeof UserUpdateSchema.infer;

/**
 * Схема смены пароля
 */
export const ChangePasswordSchema = type({
	currentPassword: 'string >= 1',
	newPassword: PasswordStrongSchema,
	confirmPassword: 'string >= 1'
}).narrow((value, ctx) => {
	if (value.newPassword !== value.confirmPassword) {
		return ctx.mustBe('пароли должны совпадать');
	}
	return true;
});
export type ChangePassword = typeof ChangePasswordSchema.infer;

/**
 * Схема сброса пароля
 */
export const ResetPasswordSchema = type({
	token: 'string >= 1',
	newPassword: PasswordStrongSchema,
	confirmPassword: 'string >= 1'
}).narrow((value, ctx) => {
	if (value.newPassword !== value.confirmPassword) {
		return ctx.mustBe('пароли должны совпадать');
	}
	return true;
});
export type ResetPassword = typeof ResetPasswordSchema.infer;

// ============================================================================
// РОССИЙСКИЕ БИЗНЕС-СХЕМЫ
// ============================================================================

/**
 * Схема юридического лица
 */
export const LegalEntitySchema = type({
	name: AddressSchema,
	inn: INN10Schema,
	'kpp?': KPPSchema,
	ogrn: OGRN13Schema,
	'address?': AddressSchema
});
export type LegalEntity = typeof LegalEntitySchema.infer;

/**
 * Схема ИП
 */
export const IndividualEntrepreneurSchema = type({
	name: AddressSchema,
	inn: INN12Schema,
	ogrnip: OGRN15Schema,
	'address?': AddressSchema
});
export type IndividualEntrepreneur = typeof IndividualEntrepreneurSchema.infer;

/**
 * Схема банковских реквизитов
 */
export const BankDetailsSchema = type({
	bankName: 'string >= 1',
	bik: BIKSchema,
	accountNumber: 'string', // 20 цифр
	corrAccount: 'string' // 20 цифр
});
export type BankDetails = typeof BankDetailsSchema.infer;

// ============================================================================
// ПАГИНАЦИЯ
// ============================================================================

/**
 * Параметры пагинации
 */
export const PaginationSchema = type({
	'page?': 'number.integer >= 1',
	'limit?': 'number.integer >= 1',
	'sortBy?': 'string',
	'sortOrder?': "'asc' | 'desc'"
});
export type Pagination = typeof PaginationSchema.infer;

/**
 * Параметры поиска
 */
export const SearchParamsSchema = type({
	'query?': 'string',
	'page?': 'number.integer >= 1',
	'limit?': 'number.integer >= 1'
});
export type SearchParams = typeof SearchParamsSchema.infer;

// ============================================================================
// SCOPE С ВСЕМИ ТИПАМИ
// ============================================================================

/**
 * Scope со всеми валидационными типами
 */
export const validationScope = scope({
	// Базовые
	email: 'string.email',
	url: 'string.url',
	uuid: 'string.uuid.v4',

	// Числа
	money: 'number >= 0',
	positiveInt: 'number.integer > 0',

	// Строки
	nonEmptyString: 'string >= 1',
	passwordSimple: 'string >= 6'
});

export const v = validationScope.export();

// ============================================================================
// УТИЛИТЫ
// ============================================================================

/**
 * Проверить данные и вернуть Result
 */
export function validate<T>(
	schema: { (data: unknown): T | type.errors },
	data: unknown
):
	| { success: true; data: T; errors?: never }
	| { success: false; data?: never; errors: string[] } {
	const result = schema(data);

	if (result instanceof type.errors) {
		return {
			success: false,
			errors: result.map((e) => e.message)
		};
	}

	return {
		success: true,
		data: result
	};
}

/**
 * Проверить данные и выбросить ошибку если невалидны
 */
export function validateOrThrow<T>(
	schema: { (data: unknown): T | type.errors },
	data: unknown
): T {
	const result = schema(data);

	if (result instanceof type.errors) {
		throw new Error(`Validation failed: ${result.summary}`);
	}

	return result;
}

// Re-export type from arktype for convenience
export { type, scope, type as t } from 'arktype';
