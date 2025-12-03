<!--
  FrankFMY Platform — Initiative Development / Инициативная разработка
  @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
  @copyright 2025 Artyom Pryanishnikov | @license PolyForm-Shield-1.0.0
-->
<script lang="ts">
	import { cn } from './utils';

	interface Props {
		variant?: 'success' | 'error' | 'warning' | 'info';
		message: string;
		description?: string;
		dismissible?: boolean;
		ondismiss?: () => void;
		class?: string;
	}

	let {
		variant = 'info',
		message,
		description,
		dismissible = true,
		ondismiss,
		class: className
	}: Props = $props();

	const variantStyles = {
		success: {
			bg: 'bg-green-50 dark:bg-green-900/20',
			border: 'border-green-200 dark:border-green-800',
			icon: 'text-green-500',
			title: 'text-green-800 dark:text-green-200',
			desc: 'text-green-700 dark:text-green-300'
		},
		error: {
			bg: 'bg-red-50 dark:bg-red-900/20',
			border: 'border-red-200 dark:border-red-800',
			icon: 'text-red-500',
			title: 'text-red-800 dark:text-red-200',
			desc: 'text-red-700 dark:text-red-300'
		},
		warning: {
			bg: 'bg-yellow-50 dark:bg-yellow-900/20',
			border: 'border-yellow-200 dark:border-yellow-800',
			icon: 'text-yellow-500',
			title: 'text-yellow-800 dark:text-yellow-200',
			desc: 'text-yellow-700 dark:text-yellow-300'
		},
		info: {
			bg: 'bg-blue-50 dark:bg-blue-900/20',
			border: 'border-blue-200 dark:border-blue-800',
			icon: 'text-blue-500',
			title: 'text-blue-800 dark:text-blue-200',
			desc: 'text-blue-700 dark:text-blue-300'
		}
	};

	const icons = {
		success: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />`,
		error: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />`,
		warning: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />`,
		info: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />`
	};

	let styles = $derived(variantStyles[variant]);
</script>

<div
	class={cn('flex items-start gap-3 rounded-lg border p-4', styles.bg, styles.border, className)}
	role="alert"
>
	<div class={cn('flex-shrink-0', styles.icon)}>
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			{@html icons[variant]}
		</svg>
	</div>

	<div class="flex-1">
		<p class={cn('text-sm font-medium', styles.title)}>{message}</p>
		{#if description}
			<p class={cn('mt-1 text-sm', styles.desc)}>{description}</p>
		{/if}
	</div>

	{#if dismissible}
		<button
			type="button"
			class={cn(
				'flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5',
				styles.icon
			)}
			onclick={ondismiss}
			aria-label="Dismiss"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
		</button>
	{/if}
</div>
