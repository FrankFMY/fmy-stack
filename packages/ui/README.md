# @frankfmy/ui

Svelte 5 components for forms, tables, overlays, feedback, and themes, styled with Tailwind CSS v4.

[npm](https://www.npmjs.com/package/@frankfmy/ui) · [Source](https://github.com/FrankFMY/fmy-stack/tree/main/packages/ui) · [Issues](https://github.com/FrankFMY/fmy-stack/issues)

## Release status and requirements

This README documents the **1.1.2 API contract**. The npm page identifies available published versions; use the matching package version with these component and CSS contracts.

- Svelte `^5.0.0` and a Svelte-aware compiler pipeline are required, such as SvelteKit or Vite with the Svelte plugin.
- The root export includes `.svelte` modules and must be compiled for both browser and SSR use. It is **not a native Node.js root import**, even if you only want `cn` or theme helpers. There is no separate plain-JavaScript utilities entry point.
- Tailwind CSS v4 must process the application stylesheet. The package does not ship precompiled component CSS.

## Installation and required CSS setup

For an existing Svelte 5 application, install a published version:

```bash
bun add @frankfmy/ui
```

Configure Tailwind CSS v4 in your application build, using its Vite or PostCSS integration. Then create or update your global application stylesheet:

```css
@import "tailwindcss";
@import "@frankfmy/ui/styles.css";

/* Match the .dark class applied by ThemeProvider and setTheme. */
@custom-variant dark (&:where(.dark, .dark *));
```

Import that stylesheet once from your application entry point. For example, in a SvelteKit root layout:

```svelte
<script lang="ts">
  import '../app.css';
  let { children } = $props();
</script>

{@render children()}
```

`@frankfmy/ui/styles.css` contains only a Tailwind v4 `@source` registration for packaged `.js` and `.svelte` files. It does not generate CSS by itself, import Tailwind, or define a global reset or theme. The `tailwindcss` import supplies Tailwind's default theme, preflight, and utilities. The custom dark variant makes manual theme switching work instead of relying on Tailwind's default media-query dark mode.

## Components

Examples below belong in Svelte 5 components. Components accept a `class` prop unless noted otherwise; `cn` merges conditional classes and resolves Tailwind class conflicts.

### Button

Variants: `primary` (default), `secondary`, `outline`, `ghost`, `danger`. Sizes: `sm`, `md` (default), `lg`. Native button attributes and event handlers are forwarded. The default `type` is `button`; use `type="submit"` inside forms when needed. `loading` disables the button and shows a spinner.

```svelte
<script lang="ts">
  import { Button } from '@frankfmy/ui';
</script>

<Button>Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost" size="sm">Small action</Button>
<Button variant="danger" size="lg">Delete</Button>
<Button loading fullWidth>Saving</Button>
```

### Input

Supports native input attributes and handlers, plus `label`, `hint`, `error`, and `leftIcon` / `rightIcon` snippets. Supply an explicit `id` for a stable label association across SSR and hydration. `value` is **not bindable** on this component: pass it in and update state through `oninput` rather than using `bind:value`.

```svelte
<script lang="ts">
  import { Input } from '@frankfmy/ui';
  let email = $state('');
</script>

<Input
  id="email"
  label="Email"
  type="email"
  value={email}
  oninput={(event) => email = event.currentTarget.value}
  hint="We will use this address for notifications."
/>
<Input id="password" label="Password" type="password" error="Password is required." />
<Input id="disabled-field" disabled placeholder="Disabled" />
```

### Badge

Variants: `default`, `success`, `warning`, `error`, `info`. Sizes: `sm`, `md`, `lg`. Set `dot` to display a status indicator.

```svelte
<script lang="ts">
  import { Badge } from '@frankfmy/ui';
</script>

<Badge>Draft</Badge>
<Badge variant="success" dot>Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error" size="sm">Failed</Badge>
<Badge variant="info">Information</Badge>
```

### Card

Use `title` and `description` for the default header, or a `header` snippet to replace it. Also accepts `footer`, `hoverable`, and `padding="none|sm|md|lg"` (default `md`).

```svelte
<script lang="ts">
  import { Card, Button } from '@frankfmy/ui';
</script>

<Card>
  {#snippet header()}
    <h3>Account</h3>
  {/snippet}

  <p>Manage your account preferences.</p>

  {#snippet footer()}
    <Button>Save</Button>
  {/snippet}
</Card>
```

### Modal

Bind `open`, not `isOpen`. The close callback is lowercase `onclose`. Supports `title`, a `footer` snippet, sizes `sm`, `md` (default), `lg`, `xl`, `full`, and the boolean options `closeOnBackdrop`, `closeOnEsc`, `showCloseButton` (all default to `true`).

```svelte
<script lang="ts">
  import { Modal, Button } from '@frankfmy/ui';
  let open = $state(false);
</script>

<Button onclick={() => open = true}>Open modal</Button>

<Modal bind:open title="Account settings" onclose={() => console.log('Closed')}>
  <p>Update your preferences here.</p>
  {#snippet footer()}
    <Button onclick={() => open = false}>Done</Button>
  {/snippet}
</Modal>
```

The component renders a dialog with a backdrop but does not implement focus trapping, focus restoration, or body scroll locking. Test and supply any additional focus management your application requires. Its built-in close-button label is Russian.

### Toast

Variants: `success`, `error`, `warning`, `info` (default). `message` is required; `description` is optional. The dismiss button calls `ondismiss`; the parent must remove the toast. There is no built-in queue or auto-dismiss timer.

```svelte
<script lang="ts">
  import { Toast } from '@frankfmy/ui';
  let visible = $state(true);
</script>

{#if visible}
  <Toast
    message="Saved"
    description="Your changes are available."
    variant="success"
    ondismiss={() => visible = false}
  />
{/if}
<Toast message="Connection unavailable" variant="error" dismissible={false} />
```

### DataTable

`data` and `columns` are required. Each column has `key`, `label`, optional `sortable`, `width`, `align` (`left`, `center`, `right`), and a `render(value, row)` Svelte snippet for custom cells. Optional props include `loading`, `striped`, `hoverable` (default `true`), `bordered`, `compact`, `emptyMessage`, and `rowKey`.

Sorting updates bindable `sortKey` / `sortOrder` and calls `onSort(key, order)`; it does **not** reorder `data`. Sort or refetch rows in the parent. `onRowClick(row, index)` receives the selected row and its index.

```svelte
<script lang="ts">
  import { DataTable } from '@frankfmy/ui';

  type Row = { id: number; name: string; email: string };
  let data = $state<Row[]>([
    { id: 1, name: 'John', email: 'john@example.com' },
    { id: 2, name: 'Jane', email: 'jane@example.com' }
  ]);
  const columns: { key: keyof Row; label: string; sortable?: boolean }[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' }
  ];

  function sortRows(key: keyof Row, order: 'asc' | 'desc') {
    data = [...data].sort((a, b) => {
      const comparison = key === 'id'
        ? a.id - b.id
        : String(a[key]).localeCompare(String(b[key]));
      return order === 'asc' ? comparison : -comparison;
    });
  }
</script>

<DataTable
  {data}
  {columns}
  rowKey="id"
  striped
  emptyMessage="No records"
  onSort={sortRows}
  onRowClick={(row) => console.log(row.email)}
/>
```

### Pagination

`page` is one-based and bindable; `totalPages` is required. `onchange(page)` runs on a valid user-selected page change. `showFirstLast` defaults to `true`, and `siblingCount` defaults to `1`. The component does not fetch data.

```svelte
<script lang="ts">
  import { Pagination } from '@frankfmy/ui';
  let page = $state(1);
</script>

<Pagination bind:page totalPages={10} onchange={(next) => console.log('Page', next)} />
<p>Current page: {page}</p>
```

### Skeleton

Variants: `text` (default), `circular`, `rectangular`, `rounded`. Accepts CSS `width` and `height` strings, `lines` for text, and `animate` (default `true`).

```svelte
<script lang="ts">
  import { Skeleton } from '@frankfmy/ui';
</script>

<Skeleton lines={3} />
<Skeleton variant="circular" width="48px" height="48px" />
<Skeleton variant="rectangular" height="200px" />
<Skeleton variant="rounded" height="80px" animate={false} />
```

### EmptyState

Accepts `title`, `description`, and `icon` / `action` snippets. The default title is Russian; provide your application's localized text explicitly.

```svelte
<script lang="ts">
  import { EmptyState, Button } from '@frankfmy/ui';
</script>

<EmptyState title="No records" description="Try changing your filters.">
  {#snippet action()}
    <Button>Add record</Button>
  {/snippet}
</EmptyState>
```

### Theme and class utilities

```svelte
<script lang="ts">
  import {
    ThemeProvider, ThemeSwitcher, getTheme, getResolvedTheme,
    setTheme, toggleTheme, cn, type Theme
  } from '@frankfmy/ui';

  const preferredTheme: Theme = 'system';
</script>

<ThemeProvider defaultTheme={preferredTheme}>
  <ThemeSwitcher />
  <button class={cn('px-2 py-1', 'px-4')} onclick={() => setTheme('dark')}>
    Use dark theme
  </button>
  <button onclick={toggleTheme}>Toggle light/dark</button>
  <p>Preference: {getTheme()}; resolved: {getResolvedTheme()}</p>
</ThemeProvider>
```

- `Theme` is `'light' | 'dark' | 'system'`. `getTheme()` returns the preference, while `getResolvedTheme()` returns `'light' | 'dark'`.
- In the browser, theme initialization reads `localStorage` under `frankfmy-theme`, applies a `.dark` class to the document element, and listens for system preference changes. `setTheme()` persists the preference; `toggleTheme()` switches the resolved light/dark value to the opposite explicit theme.
- `ThemeProvider` accepts `defaultTheme` (default `system`) and required child content, with no `class` prop. It applies the default in a client effect only if no stored preference exists. Theme state is module-level, not isolated per provider. Do not mutate it per request during SSR; browser initialization determines the actual client theme.
- `ThemeSwitcher` accepts `showLabels` and `class`. Its built-in labels are Russian; leave labels hidden or supply your own controls for another language.
- `cn(...inputs)` combines `clsx` inputs and applies `tailwind-merge`. Import it through the Svelte-aware pipeline described above.

## Author and license

By [Artem Prianishnikov](https://github.com/FrankFMY/fmy-stack#author).

The current author-owned source is licensed under Apache-2.0; see [LICENSE](./LICENSE) and [NOTICE](./NOTICE). Previously published versions **1.1.1 and earlier remain under their original PolyForm Noncommercial license**. This change does not retroactively relicense those releases or third-party code.
