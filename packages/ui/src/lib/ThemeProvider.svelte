<!--
  FMY Stack
  @author Artem Prianishnikov <Pryanishnikovartem@gmail.com>
  @copyright 2026 Artem Prianishnikov | @license Apache-2.0
-->
<script lang="ts" module>
	/**
	 * Тип темы приложения.
	 * - 'light' - светлая тема
	 * - 'dark' - темная тема
	 * - 'system' - автоматический выбор на основе системных настроек
	 */
	export type Theme = 'light' | 'dark' | 'system';

	const THEME_KEY = 'frankfmy-theme';
	let currentTheme = $state<Theme>('system');
	let resolvedTheme = $state<'light' | 'dark'>('light');

	/**
	 * Получает текущую установленную тему.
	 * @returns Текущая тема ('light', 'dark' или 'system').
	 * @example
	 * const theme = getTheme(); // 'light' | 'dark' | 'system'
	 */
	export function getTheme(): Theme {
		return currentTheme;
	}

	/**
	 * Устанавливает тему приложения.
	 * Сохраняет выбор пользователя в localStorage и применяет тему немедленно.
	 * @param theme - Тема для установки ('light', 'dark' или 'system').
	 * @example
	 * setTheme('dark'); // Установить темную тему
	 * setTheme('system'); // Использовать системные настройки
	 */
	export function setTheme(theme: Theme): void {
		currentTheme = theme;

		if (typeof window !== 'undefined') {
			localStorage.setItem(THEME_KEY, theme);
			applyTheme(theme);
		}
	}

	/**
	 * Переключает между светлой и темной темой.
	 * Переключает на противоположную тему (light ↔ dark).
	 * @example
	 * toggleTheme(); // Переключить с текущей на противоположную
	 */
	export function toggleTheme(): void {
		const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
		setTheme(newTheme);
	}

	/**
	 * Получает реальную применяемую тему (разрешенную).
	 * Если выбрана тема 'system', возвращает фактически применяемую тему на основе системных настроек.
	 * @returns Фактическая тема: 'light' или 'dark'.
	 * @example
	 * const resolved = getResolvedTheme(); // 'light' или 'dark'
	 */
	export function getResolvedTheme(): 'light' | 'dark' {
		return resolvedTheme;
	}

	function applyTheme(theme: Theme): void {
		if (typeof window === 'undefined') return;

		let effectiveTheme: 'light' | 'dark';

		if (theme === 'system') {
			effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		} else {
			effectiveTheme = theme;
		}

		resolvedTheme = effectiveTheme;

		if (effectiveTheme === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}

	function initTheme(): void {
		if (typeof window === 'undefined') return;

		const stored = localStorage.getItem(THEME_KEY) as Theme | null;
		currentTheme = stored ?? 'system';
		applyTheme(currentTheme);

		// Listen for system preference changes
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
			if (currentTheme === 'system') {
				applyTheme('system');
			}
		});
	}

	// Initialize on module load (client-side only)
	if (typeof window !== 'undefined') {
		initTheme();
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * Пропсы компонента ThemeProvider.
	 */
	interface Props {
		/** Тема по умолчанию, если в localStorage нет сохраненной темы. */
		defaultTheme?: Theme;
		/** Дочерний контент (слот для рендеринга). */
		children: Snippet;
	}

	let { defaultTheme = 'system', children }: Props = $props();

	$effect(() => {
		if (typeof window !== 'undefined' && !localStorage.getItem(THEME_KEY)) {
			setTheme(defaultTheme);
		}
	});
</script>

{@render children()}
