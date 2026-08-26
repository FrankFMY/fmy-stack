<!--
  FMY Stack
  @author Artem Prianishnikov <Pryanishnikovartem@gmail.com>
  @copyright 2026 Artem Prianishnikov | @license Apache-2.0
-->
<script lang="ts" generics="T extends Record<string, unknown>">
	import type { Snippet } from 'svelte';
	import { cn } from './utils';

	// Export interfaces for external use
	export interface DataTableColumn<T> {
		key: keyof T;
		label: string;
		sortable?: boolean;
		width?: string;
		align?: 'left' | 'center' | 'right';
		render?: Snippet<[T[keyof T], T]>;
	}

	export interface DataTableProps<T> {
		data: T[];
		columns: DataTableColumn<T>[];
		loading?: boolean;
		striped?: boolean;
		hoverable?: boolean;
		bordered?: boolean;
		compact?: boolean;
		emptyMessage?: string;
		sortKey?: keyof T | null;
		sortOrder?: 'asc' | 'desc';
		onSort?: (key: keyof T, order: 'asc' | 'desc') => void;
		onRowClick?: (row: T, index: number) => void;
		rowKey?: keyof T;
		class?: string;
	}

	let {
		data,
		columns,
		loading = false,
		striped = false,
		hoverable = true,
		bordered = false,
		compact = false,
		emptyMessage = 'Нет данных для отображения',
		sortKey = $bindable(null),
		sortOrder = $bindable('asc'),
		onSort,
		onRowClick,
		rowKey,
		class: className
	}: DataTableProps<T> = $props();

	function handleSort(key: keyof T) {
		const column = columns.find((c) => c.key === key);
		if (!column?.sortable) return;

		if (sortKey === key) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortOrder = 'asc';
		}

		onSort?.(key, sortOrder);
	}

	function handleRowClick(row: T, index: number) {
		onRowClick?.(row, index);
	}

	function getRowKey(row: T, index: number): string | number {
		if (rowKey && row[rowKey] != null) {
			return String(row[rowKey]);
		}
		return index;
	}

	const alignClasses = {
		left: 'text-left',
		center: 'text-center',
		right: 'text-right'
	};
</script>

<div
	class={cn('overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700', className)}
>
	<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
		<thead class="bg-gray-50 dark:bg-gray-800">
			<tr>
				{#each columns as column (column.key)}
					<th
						class={cn(
							compact ? 'px-4 py-2' : 'px-6 py-3',
							alignClasses[column.align ?? 'left'],
							'text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400',
							column.sortable &&
								'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700'
						)}
						style:width={column.width}
						onclick={() => column.sortable && handleSort(column.key)}
					>
						<div class="flex items-center gap-1">
							<span>{column.label}</span>
							{#if column.sortable}
								<span class="flex flex-col">
									<svg
										class={cn(
											'h-3 w-3',
											sortKey === column.key && sortOrder === 'asc'
												? 'text-blue-600'
												: 'text-gray-400'
										)}
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<path d="M7 14l5-5 5 5z" />
									</svg>
									<svg
										class={cn(
											'-mt-1 h-3 w-3',
											sortKey === column.key && sortOrder === 'desc'
												? 'text-blue-600'
												: 'text-gray-400'
										)}
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<path d="M7 10l5 5 5-5z" />
									</svg>
								</span>
							{/if}
						</div>
					</th>
				{/each}
			</tr>
		</thead>

		<tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
			{#if loading}
				{#each Array(5) as _, i}
					<tr>
						{#each columns as column (column.key)}
							<td class={compact ? 'px-4 py-2' : 'px-6 py-4'}>
								<div class="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
							</td>
						{/each}
					</tr>
				{/each}
			{:else if data.length === 0}
				<tr>
					<td
						colspan={columns.length}
						class={cn(
							compact ? 'px-4 py-8' : 'px-6 py-12',
							'text-center text-gray-500 dark:text-gray-400'
						)}
					>
						{emptyMessage}
					</td>
				</tr>
			{:else}
				{#each data as row, index (getRowKey(row, index))}
					<tr
						class={cn(
							striped && index % 2 === 1 && 'bg-gray-50 dark:bg-gray-800/50',
							hoverable && 'hover:bg-gray-100 dark:hover:bg-gray-800',
							onRowClick && 'cursor-pointer',
							bordered && 'border-b border-gray-200 dark:border-gray-700'
						)}
						onclick={() => handleRowClick(row, index)}
					>
						{#each columns as column (column.key)}
							<td
								class={cn(
									compact ? 'px-4 py-2' : 'px-6 py-4',
									alignClasses[column.align ?? 'left'],
									'text-sm text-gray-900 dark:text-gray-100'
								)}
							>
								{#if column.render}
									{@render column.render(row[column.key], row)}
								{:else}
									{String(row[column.key] ?? '')}
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>
