/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * Утилиты для заполнения базы данных тестовыми данными (seeders)
 */

import { sql } from 'drizzle-orm';
import type { PgDatabase, PgInsertValue, PgTable } from 'drizzle-orm/pg-core';

/**
 * Тип для результата Drizzle insert операции с возможным rowCount.
 */
interface DrizzleInsertResult {
	rowCount?: number;
}

/**
 * Конфигурация для заполнения таблицы данными.
 * @template TTable Тип таблицы Drizzle ORM
 */
export interface SeederConfig<TTable extends PgTable> {
	/** Таблица для заполнения */
	table: TTable;
	/** Данные для вставки или функция, возвращающая данные */
	data: PgInsertValue<TTable>[] | (() => PgInsertValue<TTable>[]);
	/** Очистить таблицу перед вставкой (TRUNCATE) */
	truncate?: boolean;
	/** Стратегия обработки конфликтов при вставке */
	onConflict?: 'skip' | 'update';
	/** Зависимые таблицы, которые нужно заполнить первыми */
	dependencies?: Array<SeederConfig<PgTable>>;
}

/**
 * Результат выполнения seeder операции.
 */
interface SeederResult {
	/** Имя таблицы */
	table: string;
	/** Количество вставленных записей */
	inserted: number;
	/** Была ли таблица очищена (truncated) */
	truncated: boolean;
}

/**
 * Создает объект seeder для заполнения таблиц базы данных.
 * Предоставляет методы для заполнения отдельных таблиц и всех таблиц с учетом зависимостей.
 * @template TDb Тип объекта базы данных
 * @param db - Экземпляр базы данных Drizzle ORM
 * @returns Объект с методами для заполнения таблиц
 * @example
 * const seeder = createSeeder(db);
 * await seeder.seed({
 *   table: users,
 *   data: [{ name: 'John', email: 'john@example.com' }],
 *   truncate: true
 * });
 */
export function createSeeder<
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle ORM requires any for PgDatabase generic parameter
	TDb extends PgDatabase<any>
>(db: TDb) {
	return {
		/**
		 * Заполняет одну таблицу данными.
		 * @template TTable Тип таблицы
		 * @param config - Конфигурация заполнения таблицы
		 * @returns Результат операции заполнения
		 * @example
		 * await seeder.seed({
		 *   table: users,
		 *   data: () => generateUsers(10), // функция для генерации данных
		 *   truncate: true,
		 *   onConflict: 'skip'
		 * });
		 */
		async seed<TTable extends PgTable>(config: SeederConfig<TTable>): Promise<SeederResult> {
			const { table, data, truncate = false, onConflict = 'skip' } = config;
			const tableName = getTableName(table);

			// Truncate if requested
			if (truncate) {
				await db.execute(sql`TRUNCATE TABLE ${sql.identifier(tableName)} CASCADE`);
			}

			// Get data (resolve function if needed)
			const records = typeof data === 'function' ? data() : data;

			if (records.length === 0) {
				return { table: tableName, inserted: 0, truncated: truncate };
			}

			// Insert data
			let inserted = 0;

			if (onConflict === 'skip') {
				const result = (await db
					.insert(table)
					.values(records)
					.onConflictDoNothing()) as DrizzleInsertResult;
				inserted = result.rowCount ?? records.length;
			} else {
				await db.insert(table).values(records);
				inserted = records.length;
			}

			return { table: tableName, inserted, truncated: truncate };
		},

		/**
		 * Заполняет несколько таблиц с учетом зависимостей.
		 * Сначала заполняются зависимые таблицы, затем основные.
		 * @param configs - Массив конфигураций для заполнения таблиц
		 * @returns Массив результатов заполнения для каждой таблицы
		 * @example
		 * await seeder.seedAll([
		 *   { table: roles, data: [{ name: 'admin' }] },
		 *   {
		 *     table: users,
		 *     data: [{ name: 'John', roleId: roleId }],
		 *     dependencies: [{ table: roles, data: [...] }] // сначала roles
		 *   }
		 * ]);
		 */
		async seedAll(configs: Array<SeederConfig<PgTable>>): Promise<SeederResult[]> {
			const results: SeederResult[] = [];

			for (const config of configs) {
				// Seed dependencies first
				if (config.dependencies) {
					const depResults = await this.seedAll(config.dependencies);
					results.push(...depResults);
				}

				// Seed the table
				const result = await this.seed(config);
				results.push(result);
			}

			return results;
		},

		/**
		 * Очищает указанные таблицы (TRUNCATE).
		 * Полезно для сброса состояния базы данных перед тестами или повторным заполнением.
		 * @param tables - Массив таблиц для очистки
		 * @example
		 * await seeder.reset([users, roles, posts]);
		 */
		async reset(tables: PgTable[]): Promise<void> {
			const tableNames = tables.map(getTableName);

			await db.execute(
				sql`TRUNCATE TABLE ${sql.join(
					tableNames.map((name) => sql.identifier(name)),
					sql`, `
				)} CASCADE`
			);
		}
	};
}

/**
 * Вспомогательная функция для получения имени таблицы из объекта Drizzle.
 * @param table - Объект таблицы Drizzle ORM
 * @returns Имя таблицы или 'unknown' если не удалось получить
 */
/**
 * Получает имя таблицы из внутреннего символа Drizzle ORM.
 * @param table - Объект таблицы Drizzle ORM
 * @returns Имя таблицы или 'unknown' если не удалось получить
 */
function getTableName(table: PgTable): string {
	// biome-ignore lint/suspicious/noExplicitAny: Accessing Drizzle internal symbol for table name
	const tableWithSymbol = table as any;
	const drizzleNameSymbol = Symbol.for('drizzle:Name');
	return tableWithSymbol[drizzleNameSymbol] ?? 'unknown';
}

/**
 * Утилиты для генерации фейковых данных при заполнении базы.
 * Полезно для создания тестовых данных в seeders.
 */
export const fakeData = {
	/**
	 * Генерирует случайный UUID.
	 * @returns UUID строка
	 * @example
	 * const userId = fakeData.uuid(); // '550e8400-e29b-41d4-a716-446655440000'
	 */
	uuid(): string {
		return crypto.randomUUID();
	},

	/**
	 * Выбирает случайный элемент из массива.
	 * @template T Тип элементов массива
	 * @param array - Массив для выбора
	 * @returns Случайный элемент массива
	 * @example
	 * const role = fakeData.pick(['admin', 'user', 'guest']); // один из элементов
	 */
	pick<T>(array: T[]): T {
		return array[Math.floor(Math.random() * array.length)]!;
	},

	/**
	 * Генерирует случайное целое число в указанном диапазоне (включительно).
	 * @param min - Минимальное значение
	 * @param max - Максимальное значение
	 * @returns Случайное целое число от min до max
	 * @example
	 * const age = fakeData.int(18, 65); // случайное число от 18 до 65
	 */
	int(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},

	/**
	 * Генерирует случайное булево значение.
	 * @returns Случайное true или false
	 * @example
	 * const isActive = fakeData.bool(); // true или false
	 */
	bool(): boolean {
		return Math.random() > 0.5;
	},

	/**
	 * Генерирует случайную дату между двумя указанными датами.
	 * @param start - Начальная дата
	 * @param end - Конечная дата
	 * @returns Случайная дата между start и end
	 * @example
	 * const createdAt = fakeData.date(new Date('2020-01-01'), new Date('2025-01-01'));
	 */
	date(start: Date, end: Date): Date {
		return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
	},

	/**
	 * Генерирует массив из n элементов, используя фабричную функцию.
	 * @template T Тип элементов массива
	 * @param n - Количество элементов для генерации
	 * @param factory - Функция-фабрика, принимающая индекс и возвращающая элемент
	 * @returns Массив сгенерированных элементов
	 * @example
	 * const users = fakeData.array(10, (i) => ({
	 *   id: fakeData.uuid(),
	 *   name: `User ${i}`,
	 *   email: `user${i}@example.com`
	 * }));
	 */
	array<T>(n: number, factory: (index: number) => T): T[] {
		return Array.from({ length: n }, (_, i) => factory(i));
	}
};
