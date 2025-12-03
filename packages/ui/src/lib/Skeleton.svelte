<!--
  FrankFMY Platform — Initiative Development / Инициативная разработка
  @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
  @copyright 2025 Artyom Pryanishnikov | @license PolyForm-Shield-1.0.0
-->
<script lang="ts">
	import { clsx } from 'clsx';

	interface Props {
		variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
		width?: string;
		height?: string;
		lines?: number;
		animate?: boolean;
		class?: string;
	}

	let {
		variant = 'text',
		width,
		height,
		lines = 1,
		animate = true,
		class: className
	}: Props = $props();

	const variantStyles = {
		text: 'h-4 rounded',
		circular: 'rounded-full',
		rectangular: 'rounded-none',
		rounded: 'rounded-lg'
	};

	// Use $derived to make it reactive
	const baseClass = $derived(clsx('bg-gray-200 dark:bg-gray-700', animate && 'animate-pulse'));
</script>

{#if variant === 'text' && lines > 1}
	<div class={clsx('space-y-2', className)}>
		{#each Array(lines) as _, i}
			<div
				class={clsx(baseClass, variantStyles.text)}
				style:width={i === lines - 1 ? '75%' : (width ?? '100%')}
				style:height
			></div>
		{/each}
	</div>
{:else}
	<div
		class={clsx(baseClass, variantStyles[variant], className)}
		style:width={width ?? (variant === 'circular' ? '40px' : '100%')}
		style:height={height ?? (variant === 'circular' ? '40px' : undefined)}
	></div>
{/if}
