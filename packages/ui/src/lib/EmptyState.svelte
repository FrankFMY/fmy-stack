<!--
  FMY Stack
  @author Artem Prianishnikov <Pryanishnikovartem@gmail.com>
  @copyright 2026 Artem Prianishnikov | @license Apache-2.0
-->
<script lang="ts">
	import { cn } from './utils';
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		description?: string;
		icon?: Snippet;
		action?: Snippet;
		class?: string;
	}

	let { title = 'Нет данных', description, icon, action, class: className }: Props = $props();
</script>

<div class={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
	{#if icon}
		<div class="mb-4 text-gray-400 dark:text-gray-500">
			{@render icon()}
		</div>
	{:else}
		<svg
			class="mb-4 h-16 w-16 text-gray-400 dark:text-gray-500"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
			/>
		</svg>
	{/if}

	<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
		{title}
	</h3>

	{#if description}
		<p class="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
			{description}
		</p>
	{/if}

	{#if action}
		<div class="mt-6">
			{@render action()}
		</div>
	{/if}
</div>
