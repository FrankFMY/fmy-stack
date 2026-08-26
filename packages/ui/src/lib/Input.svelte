<!--
  FMY Stack
  @author Artem Prianishnikov <Pryanishnikovartem@gmail.com>
  @copyright 2026 Artem Prianishnikov | @license Apache-2.0
-->
<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { cn } from './utils';

	interface Props extends HTMLInputAttributes {
		label?: string;
		error?: string;
		hint?: string;
		leftIcon?: Snippet;
		rightIcon?: Snippet;
		class?: string;
	}

	let {
		label,
		error,
		hint,
		leftIcon,
		rightIcon,
		id,
		disabled = false,
		class: className,
		...restProps
	}: Props = $props();

	// Use $derived to ensure reactivity
	const uid = $derived(id ?? `input-${Math.random().toString(36).slice(2, 9)}`);
	const errorId = $derived(`${uid}-error`);
	const hintId = $derived(`${uid}-hint`);

	const inputStyles = `
		block w-full rounded-lg border px-3 py-2
		text-gray-900 placeholder-gray-400
		transition-colors duration-200
		focus:outline-none focus:ring-2 focus:ring-offset-0
		disabled:bg-gray-100 disabled:cursor-not-allowed
		dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500
	`;

	const normalBorder = `
		border-gray-300 
		focus:border-blue-500 focus:ring-blue-500
		dark:border-gray-600 dark:focus:border-blue-400
	`;

	const errorBorder = `
		border-red-500 
		focus:border-red-500 focus:ring-red-500
		dark:border-red-400
	`;

	let computedInputClass = $derived(
		cn(
			inputStyles,
			error ? errorBorder : normalBorder,
			leftIcon && 'pl-10',
			rightIcon && 'pr-10',
			className
		)
	);
</script>

<div class="w-full">
	{#if label}
		<label for={uid} class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
			{label}
		</label>
	{/if}

	<div class="relative">
		{#if leftIcon}
			<div
				class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"
			>
				{@render leftIcon()}
			</div>
		{/if}

		<input
			id={uid}
			class={computedInputClass}
			{disabled}
			aria-invalid={!!error}
			aria-describedby={error ? errorId : hint ? hintId : undefined}
			{...restProps}
		/>

		{#if rightIcon}
			<div
				class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
			>
				{@render rightIcon()}
			</div>
		{/if}
	</div>

	{#if error}
		<p id={errorId} class="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
	{:else if hint}
		<p id={hintId} class="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{hint}</p>
	{/if}
</div>
