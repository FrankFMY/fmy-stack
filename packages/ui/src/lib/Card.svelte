<!--
  FrankFMY Platform — Initiative Development / Инициативная разработка
  @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
  @copyright 2025 Artyom Pryanishnikov | @license PolyForm-Shield-1.0.0
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { clsx } from 'clsx';

	interface Props {
		title?: string;
		description?: string;
		padding?: 'none' | 'sm' | 'md' | 'lg';
		hoverable?: boolean;
		header?: Snippet;
		footer?: Snippet;
		children?: Snippet;
		class?: string;
	}

	let {
		title,
		description,
		padding = 'md',
		hoverable = false,
		header,
		footer,
		children,
		class: className
	}: Props = $props();

	const paddingStyles = {
		none: '',
		sm: 'p-3',
		md: 'p-4',
		lg: 'p-6'
	};

	let computedClass = $derived(
		clsx(
			'rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800',
			hoverable && 'cursor-pointer transition-shadow hover:shadow-md dark:hover:border-gray-600',
			className
		)
	);
</script>

<div class={computedClass}>
	{#if header}
		<div class="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
			{@render header()}
		</div>
	{:else if title || description}
		<div class="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
			{#if title}
				<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
					{title}
				</h3>
			{/if}
			{#if description}
				<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
			{/if}
		</div>
	{/if}

	<div class={paddingStyles[padding]}>
		{#if children}
			{@render children()}
		{/if}
	</div>

	{#if footer}
		<div
			class="border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/50"
		>
			{@render footer()}
		</div>
	{/if}
</div>
