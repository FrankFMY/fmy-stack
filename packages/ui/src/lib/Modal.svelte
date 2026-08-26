<!--
  FMY Stack
  @author Artem Prianishnikov <Pryanishnikovartem@gmail.com>
  @copyright 2026 Artem Prianishnikov | @license Apache-2.0
-->
<script lang="ts">
	import { cn } from './utils';
	import type { Snippet } from 'svelte';

	interface Props {
		open?: boolean;
		title?: string;
		size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
		closeOnBackdrop?: boolean;
		closeOnEsc?: boolean;
		showCloseButton?: boolean;
		children?: Snippet;
		footer?: Snippet;
		onclose?: () => void;
		class?: string;
	}

	let {
		open = $bindable(false),
		title,
		size = 'md',
		closeOnBackdrop = true,
		closeOnEsc = true,
		showCloseButton = true,
		children,
		footer,
		onclose,
		class: className
	}: Props = $props();

	const titleId = $derived(
		title ? `modal-title-${Math.random().toString(36).slice(2, 9)}` : undefined
	);

	const sizeStyles = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-xl',
		full: 'max-w-full mx-4'
	};

	function close() {
		open = false;
		onclose?.();
	}

	function handleBackdropClick(event: MouseEvent) {
		if (closeOnBackdrop && event.target === event.currentTarget) {
			close();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && closeOnEsc && open) {
			close();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- Backdrop with presentation role for accessibility -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		role="presentation"
		onclick={handleBackdropClick}
	>
		<!-- Modal content -->
		<dialog
			open
			class={cn(
				'relative w-full rounded-xl bg-white shadow-xl dark:bg-gray-800',
				sizeStyles[size],
				className
			)}
			aria-modal="true"
			aria-labelledby={titleId}
		>
			<!-- Header -->
			{#if title || showCloseButton}
				<div
					class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700"
				>
					{#if title}
						<h3 id={titleId} class="text-lg font-semibold text-gray-900 dark:text-gray-100">
							{title}
						</h3>
					{:else}
						<div></div>
					{/if}

					{#if showCloseButton}
						<button
							type="button"
							class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
							onclick={close}
							aria-label="Закрыть"
						>
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
			{/if}

			<!-- Body -->
			<div class="px-6 py-4">
				{#if children}
					{@render children()}
				{/if}
			</div>

			<!-- Footer -->
			{#if footer}
				<div class="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
					{@render footer()}
				</div>
			{/if}
		</dialog>
	</div>
{/if}
