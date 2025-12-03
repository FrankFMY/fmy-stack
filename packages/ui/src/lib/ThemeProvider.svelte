<!--
  FrankFMY Platform — Initiative Development / Инициативная разработка
  @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
  @copyright 2025 Artyom Pryanishnikov | @license PolyForm-Shield-1.0.0
-->
<script lang="ts" module>
	export type Theme = 'light' | 'dark' | 'system';

	const THEME_KEY = 'frankfmy-theme';
	let currentTheme = $state<Theme>('system');
	let resolvedTheme = $state<'light' | 'dark'>('light');

	export function getTheme(): Theme {
		return currentTheme;
	}

	export function setTheme(theme: Theme): void {
		currentTheme = theme;

		if (typeof window !== 'undefined') {
			localStorage.setItem(THEME_KEY, theme);
			applyTheme(theme);
		}
	}

	export function toggleTheme(): void {
		const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
		setTheme(newTheme);
	}

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

	interface Props {
		defaultTheme?: Theme;
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
