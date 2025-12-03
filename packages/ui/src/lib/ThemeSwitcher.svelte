<!--
  FrankFMY Platform — Initiative Development / Инициативная разработка
  @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
  @copyright 2025 Artyom Pryanishnikov | @license PolyForm-Shield-1.0.0
-->
<script lang="ts">
	import { getTheme, setTheme, type Theme } from './ThemeProvider.svelte';

	interface Props {
		showLabels?: boolean;
		class?: string;
	}

	let { showLabels = false, class: className }: Props = $props();

	let currentTheme = $derived(getTheme());

	const themes: { value: Theme; label: string; icon: string }[] = [
		{ value: 'light', label: 'Светлая', icon: '☀️' },
		{ value: 'dark', label: 'Тёмная', icon: '🌙' },
		{ value: 'system', label: 'Системная', icon: '💻' }
	];

	function handleChange(theme: Theme) {
		setTheme(theme);
	}
</script>

<div
	class={`inline-flex rounded-lg border border-gray-200 p-1 dark:border-gray-700 ${className ?? ''}`}
>
	{#each themes as theme}
		<button
			type="button"
			class={`
				flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors
				${
					currentTheme === theme.value
						? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
						: 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
				}
			`}
			onclick={() => handleChange(theme.value)}
			aria-pressed={currentTheme === theme.value}
		>
			<span>{theme.icon}</span>
			{#if showLabels}
				<span>{theme.label}</span>
			{/if}
		</button>
	{/each}
</div>
