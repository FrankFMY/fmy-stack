<!--
  FrankFMY Platform — Initiative Development / Инициативная разработка
  @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
  @copyright 2025 Artyom Pryanishnikov | @license PolyForm-Shield-1.0.0
-->
<script lang="ts">
	import { clsx } from 'clsx';

	interface Props {
		page: number;
		totalPages: number;
		showFirstLast?: boolean;
		siblingCount?: number;
		onchange?: (page: number) => void;
		class?: string;
	}

	let {
		page = $bindable(1),
		totalPages,
		showFirstLast = true,
		siblingCount = 1,
		onchange,
		class: className
	}: Props = $props();

	function getPageNumbers(): (number | 'ellipsis')[] {
		const pages: (number | 'ellipsis')[] = [];
		const totalNumbers = siblingCount * 2 + 3; // siblings + current + 2 boundaries
		const totalBlocks = totalNumbers + 2; // +2 for ellipsis

		if (totalPages <= totalBlocks) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		const leftSiblingIndex = Math.max(page - siblingCount, 1);
		const rightSiblingIndex = Math.min(page + siblingCount, totalPages);

		const showLeftEllipsis = leftSiblingIndex > 2;
		const showRightEllipsis = rightSiblingIndex < totalPages - 1;

		if (!showLeftEllipsis && showRightEllipsis) {
			const leftItemCount = 3 + 2 * siblingCount;
			for (let i = 1; i <= leftItemCount; i++) pages.push(i);
			pages.push('ellipsis');
			pages.push(totalPages);
		} else if (showLeftEllipsis && !showRightEllipsis) {
			pages.push(1);
			pages.push('ellipsis');
			const rightItemCount = 3 + 2 * siblingCount;
			for (let i = totalPages - rightItemCount + 1; i <= totalPages; i++) pages.push(i);
		} else {
			pages.push(1);
			pages.push('ellipsis');
			for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) pages.push(i);
			pages.push('ellipsis');
			pages.push(totalPages);
		}

		return pages;
	}

	function goToPage(newPage: number) {
		if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
			page = newPage;
			onchange?.(page);
		}
	}

	const buttonClass = `
		px-3 py-2 text-sm font-medium rounded-lg transition-colors
		disabled:opacity-50 disabled:cursor-not-allowed
	`;

	const activeClass = 'bg-blue-600 text-white';
	const inactiveClass =
		'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700';
</script>

<nav class={clsx('flex items-center justify-center gap-1', className)} aria-label="Pagination">
	{#if showFirstLast}
		<button
			type="button"
			class={clsx(buttonClass, inactiveClass)}
			disabled={page === 1}
			onclick={() => goToPage(1)}
			aria-label="First page"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
				/>
			</svg>
		</button>
	{/if}

	<button
		type="button"
		class={clsx(buttonClass, inactiveClass)}
		disabled={page === 1}
		onclick={() => goToPage(page - 1)}
		aria-label="Previous page"
	>
		<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
		</svg>
	</button>

	{#each getPageNumbers() as pageNum}
		{#if pageNum === 'ellipsis'}
			<span class="px-2 text-gray-500">...</span>
		{:else}
			<button
				type="button"
				class={clsx(buttonClass, pageNum === page ? activeClass : inactiveClass)}
				onclick={() => goToPage(pageNum)}
				aria-current={pageNum === page ? 'page' : undefined}
			>
				{pageNum}
			</button>
		{/if}
	{/each}

	<button
		type="button"
		class={clsx(buttonClass, inactiveClass)}
		disabled={page === totalPages}
		onclick={() => goToPage(page + 1)}
		aria-label="Next page"
	>
		<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
		</svg>
	</button>

	{#if showFirstLast}
		<button
			type="button"
			class={clsx(buttonClass, inactiveClass)}
			disabled={page === totalPages}
			onclick={() => goToPage(totalPages)}
			aria-label="Last page"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 5l7 7-7 7M5 5l7 7-7 7"
				/>
			</svg>
		</button>
	{/if}
</nav>
