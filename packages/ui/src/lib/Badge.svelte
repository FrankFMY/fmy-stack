<!--
  FMY Stack
  @author Artem Prianishnikov <Pryanishnikovartem@gmail.com>
  @copyright 2026 Artem Prianishnikov | @license Apache-2.0
-->
<script lang="ts">
	import { cn } from './utils';
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
		size?: 'sm' | 'md' | 'lg';
		dot?: boolean;
		children?: Snippet;
		class?: string;
	}

	let {
		variant = 'default',
		size = 'md',
		dot = false,
		children,
		class: className
	}: Props = $props();

	const baseStyles = 'inline-flex items-center font-medium rounded-full';

	const variantStyles = {
		default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
		success: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
		warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
		error: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
		info: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
	};

	const dotColors = {
		default: 'bg-gray-500',
		success: 'bg-green-500',
		warning: 'bg-yellow-500',
		error: 'bg-red-500',
		info: 'bg-blue-500'
	};

	const sizeStyles = {
		sm: 'px-2 py-0.5 text-xs',
		md: 'px-2.5 py-1 text-sm',
		lg: 'px-3 py-1.5 text-base'
	};

	let computedClass = $derived(
		cn(baseStyles, variantStyles[variant], sizeStyles[size], className)
	);
</script>

<span class={computedClass}>
	{#if dot}
		<span class={cn('mr-1.5 h-1.5 w-1.5 rounded-full', dotColors[variant])}></span>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</span>
