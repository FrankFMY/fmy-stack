<!--
  FMY Stack
  @author Artem Prianishnikov <Pryanishnikovartem@gmail.com>
  @copyright 2026 Artem Prianishnikov | @license Apache-2.0
-->
<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { cn } from './utils';

	interface Props extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		loading?: boolean;
		fullWidth?: boolean;
		children?: Snippet;
		class?: string;
	}

	let {
		variant = 'primary',
		size = 'md',
		loading = false,
		fullWidth = false,
		disabled = false,
		type = 'button',
		children,
		class: className,
		...restProps
	}: Props = $props();

	const baseStyles = `
		inline-flex items-center justify-center gap-2
		font-medium rounded-lg
		transition-all duration-200
		focus:outline-none focus:ring-2 focus:ring-offset-2
		disabled:opacity-50 disabled:cursor-not-allowed
	`;

	const variantStyles = {
		primary: `
			bg-blue-600 text-white
			hover:bg-blue-700
			focus:ring-blue-500
			dark:bg-blue-500 dark:hover:bg-blue-600
		`,
		secondary: `
			bg-gray-100 text-gray-900
			hover:bg-gray-200
			focus:ring-gray-500
			dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600
		`,
		outline: `
			border border-gray-300 text-gray-700 bg-transparent
			hover:bg-gray-50
			focus:ring-gray-500
			dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800
		`,
		ghost: `
			text-gray-700 bg-transparent
			hover:bg-gray-100
			focus:ring-gray-500
			dark:text-gray-300 dark:hover:bg-gray-800
		`,
		danger: `
			bg-red-600 text-white
			hover:bg-red-700
			focus:ring-red-500
			dark:bg-red-500 dark:hover:bg-red-600
		`
	};

	const sizeStyles = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-base',
		lg: 'px-6 py-3 text-lg'
	};

	let computedClass = $derived(
		cn(baseStyles, variantStyles[variant], sizeStyles[size], fullWidth && 'w-full', className)
	);
</script>

<button
	{type}
	class={computedClass}
	disabled={disabled || loading}
	aria-busy={loading}
	{...restProps}
>
	{#if loading}
		<svg
			class="h-4 w-4 animate-spin"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
			></circle>
			<path
				class="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			></path>
		</svg>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</button>
