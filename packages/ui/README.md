# @frankfmy/ui

> Svelte 5 UI components with TailwindCSS v4

## Installation

```bash
bun add @frankfmy/ui
```

## Components

### Button

```svelte
<script>
  import { Button } from '@frankfmy/ui';
</script>

<Button>Default</Button>
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Destructive</Button>

<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔥</Button>
```

### Input

```svelte
<script>
  import { Input } from '@frankfmy/ui';
  let value = $state('');
</script>

<Input bind:value placeholder="Enter text..." />
<Input type="email" placeholder="email@example.com" />
<Input type="password" placeholder="Password" />
<Input disabled placeholder="Disabled" />
```

### Badge

```svelte
<script>
  import { Badge } from '@frankfmy/ui';
</script>

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
```

### Card

```svelte
<script>
  import { Card } from '@frankfmy/ui';
</script>

<Card>
  {#snippet header()}
    <h3>Card Title</h3>
  {/snippet}
  
  <p>Card content goes here...</p>
  
  {#snippet footer()}
    <Button>Action</Button>
  {/snippet}
</Card>
```

### Modal

```svelte
<script>
  import { Modal, Button } from '@frankfmy/ui';
  let isOpen = $state(false);
</script>

<Button onclick={() => isOpen = true}>Open Modal</Button>

<Modal bind:isOpen onClose={() => isOpen = false}>
  <h2>Modal Title</h2>
  <p>Modal content...</p>
</Modal>
```

### Toast

```svelte
<script>
  import { Toast } from '@frankfmy/ui';
</script>

<Toast message="Success!" variant="success" />
<Toast message="Error occurred" variant="error" />
<Toast message="Warning!" variant="warning" />
```

### DataTable

```svelte
<script>
  import { DataTable } from '@frankfmy/ui';
  
  const data = [
    { id: 1, name: 'John', email: 'john@example.com' },
    { id: 2, name: 'Jane', email: 'jane@example.com' }
  ];
  
  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' }
  ];
</script>

<DataTable
  {data}
  {columns}
  striped
  hoverable
  onRowClick={(row) => console.log(row)}
/>
```

### Pagination

```svelte
<script>
  import { Pagination } from '@frankfmy/ui';
  let page = $state(1);
</script>

<Pagination
  bind:page
  totalPages={10}
  onchange={(p) => fetchData(p)}
/>
```

### Skeleton

```svelte
<script>
  import { Skeleton } from '@frankfmy/ui';
</script>

<Skeleton variant="text" lines={3} />
<Skeleton variant="circular" width="48px" height="48px" />
<Skeleton variant="rectangular" height="200px" />
```

### EmptyState

```svelte
<script>
  import { EmptyState, Button } from '@frankfmy/ui';
</script>

<EmptyState
  title="Нет данных"
  description="Попробуйте изменить фильтры"
>
  {#snippet action()}
    <Button>Добавить</Button>
  {/snippet}
</EmptyState>
```

### Theme

```svelte
<script>
  import { ThemeProvider, ThemeSwitcher, getTheme, setTheme } from '@frankfmy/ui';
</script>

<ThemeProvider defaultTheme="system">
  <ThemeSwitcher showLabels />
  
  <!-- Your app content -->
</ThemeProvider>
```

## License

Apache-2.0 © 2026 Artem Prianishnikov

