# Svelte for React Developers: Architectural Overview

This guide explains how the Eisenberg Oscar Party application is structured in Svelte, mapping familiar React concepts to their Svelte equivalents.

---

## Table of Contents

1. [Core Framework Differences](#core-framework-differences)
2. [Project Structure](#project-structure)
3. [File Organization & Routing](#file-organization--routing)
4. [Component Architecture](#component-architecture)
5. [State Management](#state-management)
6. [Side Effects & Lifecycle](#side-effects--lifecycle)
7. [Data Loading & Server Functions](#data-loading--server-functions)
8. [Styling](#styling)
9. [Practical Comparison Examples](#practical-comparison-examples)

---

## Core Framework Differences

### The Fundamental Shift: Compiler vs. Runtime

**React (Runtime):**
- Code runs in the browser at runtime
- Components are JavaScript functions
- State updates trigger re-renders
- Uses Virtual DOM diffing

**Svelte (Compiler):**
- Code is compiled to vanilla JavaScript at build time
- Components are compiled templates
- Reactivity is built into the language via reactive assignments
- No Virtual DOM—direct DOM manipulation
- Smaller bundle size, better performance

### Svelte's Compiler Magic

```svelte
<script>
  let count = 0;
  
  // This assignment automatically triggers reactivity
  function increment() {
    count += 1; // Component updates—no setState() needed!
  }
</script>

<button on:click={increment}>
  Count: {count}
</button>
```

This is **reactive by default**. Compare to React:

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

---

## Project Structure

```
src-svelte/
├── routes/          # SvelteKit file-based router (similar to Next.js)
├── lib/
│   ├── components/  # Reusable Svelte components
│   ├── services/    # API calls, Firebase integration
│   ├── stores/      # Global state (like Redux/Zustand)
│   ├── constants.js # Constants (like React constants)
│   ├── helpers.js   # Utility functions
│   └── styles/      # Global CSS
├── app.html         # HTML template (like React's index.html)
└── +layout.svelte   # Root layout component
```

### Why `src-svelte/`?

The custom `src-svelte/` directory is configured in [svelte.config.js](svelte.config.js) under `kit.files.routes`. This allows the project to coexist with other source directories during migration or for organizational purposes.

---

## File Organization & Routing

### SvelteKit's File-Based Routing

SvelteKit uses **file-based routing** like Next.js. The directory structure automatically maps to routes:

```
src-svelte/routes/
├── +layout.svelte        → Applies to ALL routes (root layout)
├── +page.svelte          → GET / → Home page
├── login/
│   └── +page.svelte      → GET /login
├── register/
│   └── +page.svelte      → GET /register
├── scoreboard/
│   ├── +page.svelte      → GET /scoreboard
│   ├── [year]/
│   │   ├── +page.svelte  → GET /scoreboard/:year
│   │   └── [uid]/
│   │       └── +page.svelte → GET /scoreboard/:year/:uid
└── admin/
    └── [id]/
        └── +page.svelte  → GET /admin/:id
```

**React Equivalent:** This is similar to React Router with nested routes, but automatic.

### Two-File Convention: `+page` & `+layout`

#### `+page.svelte` (The Component)
This is your actual page/route component—like a React functional component.

```svelte
<script>
  export let data; // Props from the load function
</script>

<h1>My Page</h1>
<p>{data.message}</p>
```

#### `+layout.svelte` (The Wrapper)
This wraps all child routes—similar to React's layout pattern or a wrapper component.

```svelte
<!-- src-svelte/routes/+layout.svelte -->
<script>
  import Chrome from '$lib/components/Chrome.svelte';
</script>

<Chrome>
  <slot /> {/* Where child pages render */}
</Chrome>

<style>
  :global(body) {
    margin: 0;
  }
</style>
```

**React Equivalent:**
```jsx
// In React, you'd create a layout component and wrap routes
function RootLayout({ children }) {
  return (
    <Chrome>
      {children}
    </Chrome>
  );
}
```

---

## Component Architecture

### Anatomy of a Svelte Component

```svelte
<script>
  // JavaScript (runs once per component instance)
  import { onMount } from 'svelte';
  import { user } from '$lib/services/auth';
  
  let localState = 'initial';
  export let propFromParent = 'default'; // Props from parent
  
  function handleClick() {
    localState = 'updated'; // Triggers reactivity
  }
  
  onMount(() => {
    console.log('Component mounted');
  });
</script>

<!-- Markup (reactive, updates when script changes) -->
<div>
  <p>{localState}</p>
  <button on:click={handleClick}>
    Click me
  </button>
</div>

<!-- Component styles (scoped by default) -->
<style>
  div {
    padding: 1rem;
  }
</style>
```

### Key Differences from React

| Aspect | React | Svelte |
|--------|-------|--------|
| **State** | `useState()` | Direct variable assignment |
| **Props** | Function parameters | `export let` |
| **Scoped Styles** | CSS-in-JS or imports | `<style>` block (automatic) |
| **Side Effects** | `useEffect()` | `onMount()`, reactive statements (`$:`) |
| **Event Handlers** | `onClick={handler}` | `on:click={handler}` |
| **Conditionals** | Ternary/JSX | `{#if} {:else} {/if}` |
| **Lists** | `.map()` | `{#each} {/each}` |

### Component Examples in This Project

#### [Chrome.svelte](src-svelte/lib/components/Chrome.svelte) (Navigation Layout)
```svelte
<script>
  import { goto } from '$app/navigation';
  import { user } from '$lib/services/auth';
  import { theme } from '$lib/stores/theme';
  
  let menuOpen = false;
  
  const handleLogout = async () => {
    const { signOut } = await import('firebase/auth');
    await signOut(auth);
    await goto('/login');
  };
</script>

<nav class="...">
  {#if $user}
    <!-- Render authenticated menu -->
  {:else}
    <!-- Render public menu -->
  {/if}
</nav>

<div class="container">
  <slot /> <!-- Page content goes here -->
</div>
```

**React Equivalent:**
```jsx
export function Chrome({ children }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <>
      <nav>
        {user ? <AuthMenu onLogout={logout} /> : <PublicMenu />}
      </nav>
      <div className="container">{children}</div>
    </>
  );
}
```

---

## State Management

### Svelte Stores (Like Redux/Zustand)

Svelte has a built-in store system. Instead of Redux or Zustand, you use **Svelte Stores**.

#### Creating a Store

```javascript
// lib/stores/theme.js
import { writable } from 'svelte/store';

function createThemeStore() {
  const isBrowser = typeof window !== 'undefined';
  
  let initialDark = false;
  if (isBrowser) {
    const stored = localStorage.getItem('theme');
    initialDark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  const { subscribe, set } = writable(initialDark);

  function applyTheme(isDark) {
    if (isBrowser) {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', isDark);
    }
  }

  applyTheme(initialDark);

  return {
    subscribe,
    toggle: () => {
      let newValue;
      subscribe(current => newValue = !current)();
      applyTheme(newValue);
      set(newValue);
    }
  };
}

export const theme = createThemeStore();
```

**React Equivalent (Zustand):**
```javascript
import { create } from 'zustand';

export const useTheme = create((set) => ({
  isDark: getInitialTheme(),
  toggle: () => set((state) => ({ isDark: !state.isDark })),
  setDark: (isDark) => set({ isDark })
}));
```

#### Using a Store

In Svelte, prefix store names with `$` to **automatically subscribe and unsubscribe**:

```svelte
<script>
  import { theme } from '$lib/stores/theme';
</script>

<!-- Automatically subscribes, unsubscribes on cleanup -->
<button on:click={() => theme.toggle()}>
  {$theme ? '☀️' : '🌙'}
</button>
```

In React:
```jsx
export function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  
  return (
    <button onClick={toggle}>
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
```

#### Auth Store Example

From [services/auth.js](src-svelte/lib/services/auth.js):

```javascript
export const user = writable(null);
export const initializing = writable(true);

// Automatically updates when auth state changes
onAuthStateChanged(auth, (authUser) => {
  user.set(authUser);
  initializing.set(false);
});
```

---

## Side Effects & Lifecycle

### `onMount` (Like `useEffect` with `[]` dependency)

```svelte
<script>
  import { onMount } from 'svelte';
  
  onMount(async () => {
    // Runs once after DOM is mounted
    const data = await fetchData();
    
    // Cleanup function (optional)
    return () => {
      console.log('Component unmounting');
    };
  });
</script>
```

**React Equivalent:**
```jsx
useEffect(() => {
  const loadData = async () => {
    const data = await fetchData();
  };
  loadData();
  
  return () => {
    console.log('Component unmounting');
  };
}, []); // Empty dependency array = run once
```

### Reactive Statements (`$:`)

The `$:` label creates **reactive blocks** that run whenever their dependencies change:

```svelte
<script>
  let count = 0;
  let doubled;
  
  // This runs whenever count changes
  $: doubled = count * 2;
  
  // This logs whenever doubled changes
  $: console.log(`Doubled is now ${doubled}`);
  
  // Complex reactivity
  $: if (count > 10) {
    console.log('Count exceeds 10!');
  }
</script>

<p>Count: {count}, Doubled: {doubled}</p>
```

**React Equivalent:**
```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const [doubled, setDoubled] = useState(0);
  
  useEffect(() => {
    setDoubled(count * 2);
  }, [count]);
  
  useEffect(() => {
    console.log(`Doubled is now ${doubled}`);
  }, [doubled]);
  
  return <p>Count: {count}, Doubled: {doubled}</p>;
}
```

### Real Example: Ballot Vote Calculation

From [routes/+page.svelte](src-svelte/routes/+page.svelte):

```svelte
<script>
  let ballot = [];
  let results = [];
  let tempScore = 0;
  
  // Reactively calculate score whenever ballot or results change
  $: if (ballot.length > 0 && results.length > 0) {
    tempScore = 0;
    results.forEach((winner) => {
      if (ballot.indexOf(winner) > -1) {
        tempScore += 1;
      }
    });
  }
</script>

<PageHeading>
  My Ballot
  {#if hasBallot && locked && results.length > 0}
    <span>Score: {tempScore}/{results.length}</span>
  {/if}
</PageHeading>
```

---

## Data Loading & Server Functions

### SvelteKit's `load` Function (Similar to Next.js `getServerSideProps`)

Each route can have a `+page.ts` or `+layout.ts` file with a `load` function:

```typescript
// src-svelte/routes/+layout.ts
import { redirect } from '@sveltejs/kit';
import { user, initializing } from '$lib/services/auth';
import { get } from 'svelte/store';

export async function load({ url }) {
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.includes(url.pathname);

  // Get current store values
  const authUser = get(user);
  const isInitializing = get(initializing);

  // Redirect if needed
  if (isInitializing) {
    return { user: authUser };
  }

  if (authUser && isPublicRoute) {
    throw redirect(302, '/');
  }

  // Return data to the component
  return { user: authUser };
}
```

In the component:
```svelte
<script>
  export let data; // Receives return value from load()
</script>

<p>User: {data.user?.displayName}</p>
```

**React/Next.js Equivalent:**
```jsx
export async function getServerSideProps(context) {
  const authUser = await getCurrentUser();
  
  if (authUser && context.resolvedUrl === '/login') {
    return {
      redirect: { destination: '/', permanent: false }
    };
  }
  
  return {
    props: { user: authUser }
  };
}

export default function Page({ user }) {
  return <p>User: {user?.displayName}</p>;
}
```

---

## Styling

### Scoped Styles (Built-in)

```svelte
<script>
  export let title;
</script>

<div class="card">
  <h2>{title}</h2>
</div>

<style>
  /* This CSS is automatically scoped to this component */
  .card {
    padding: 1rem;
    border: 1px solid #ccc;
  }
  
  h2 {
    margin: 0;
    color: blue;
  }
</style>
```

The compiled output automatically scopes these styles with a component-specific class.

**React Equivalent (Requires CSS Modules or CSS-in-JS):**
```jsx
import styles from './Card.module.css';

export function Card({ title }) {
  return (
    <div className={styles.card}>
      <h2>{title}</h2>
    </div>
  );
}
```

### Global Styles

Use `:global()` selector:

```svelte
<style>
  /* Applies globally */
  :global(body) {
    margin: 0;
    padding: 0;
  }
  
  /* Scoped to this component */
  .local {
    color: red;
  }
</style>
```

### Tailwind CSS Integration

This project uses [Tailwind CSS](tailwind.config.cjs). All Svelte components can use Tailwind classes:

```svelte
<div class="max-w-xs mb-6 mt-6">
  <label class="block text-sm font-semibold mb-2">Year:</label>
  <button class="w-full p-3 bg-white border rounded-lg hover:bg-gray-50">
    Select Year
  </button>
</div>
```

---

## Practical Comparison Examples

### Example 1: Button Component

**React:**
```jsx
export function MyButton({ count, onIncrement, disabled }) {
  return (
    <button onClick={onIncrement} disabled={disabled}>
      Count: {count}
    </button>
  );
}

// Usage
const [count, setCount] = useState(0);
<MyButton count={count} onIncrement={() => setCount(count + 1)} disabled={false} />
```

**Svelte:**
```svelte
<script>
  export let count = 0;
  export let disabled = false;
  
  function handleIncrement() {
    count += 1;
  }
</script>

<button on:click={handleIncrement} {disabled}>
  Count: {count}
</button>

<!-- Usage (parent component) -->
<script>
  import MyButton from './MyButton.svelte';
  let count = 0;
</script>

<MyButton bind:count {disabled} />
```

**Key Differences:**
- Svelte: Props are imported via `export let`
- Svelte: Event handling with `on:` prefix
- Svelte: Two-way binding with `bind:` directive
- Svelte: No need to pass callbacks for state updates

### Example 2: Conditional Rendering

**React:**
```jsx
function UserMenu({ user, onLogout }) {
  if (!user) {
    return (
      <>
        <a href="/login">Login</a>
        <a href="/register">Register</a>
      </>
    );
  }
  
  return (
    <>
      <a href="/profile">Profile</a>
      <button onClick={onLogout}>Logout</button>
    </>
  );
}
```

**Svelte:**
```svelte
<script>
  import { user } from '$lib/services/auth';
</script>

{#if $user}
  <a href="/profile">Profile</a>
  <button on:click={handleLogout}>Logout</button>
{:else}
  <a href="/login">Login</a>
  <a href="/register">Register</a>
{/if}
```

### Example 3: Lists/Loops

**React:**
```jsx
function CandidateList({ candidates, selectedId, onSelect }) {
  return (
    <ul>
      {candidates.map((candidate) => (
        <li key={candidate.id}>
          <label>
            <input
              type="radio"
              checked={selectedId === candidate.id}
              onChange={() => onSelect(candidate.id)}
            />
            {candidate.text}
          </label>
        </li>
      ))}
    </ul>
  );
}
```

**Svelte:**
```svelte
<script>
  export let candidates = [];
  export let selectedId;
  
  function handleSelect(id) {
    selectedId = id;
  }
</script>

<ul>
  {#each candidates as candidate (candidate.id)}
    <li>
      <label>
        <input
          type="radio"
          checked={selectedId === candidate.id}
          on:change={() => handleSelect(candidate.id)}
        />
        {candidate.text}
      </label>
    </li>
  {/each}
</ul>
```

### Example 4: Async Data Loading (Firebase)

**React (with hooks):**
```jsx
function BallotPage() {
  const [ballot, setBallot] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    const loadBallot = async () => {
      try {
        const ref = ref(db, `/ballots/${year}/${user.uid}/votes`);
        const snapshot = await get(ref);
        setBallot(snapshot.val() || []);
      } finally {
        setLoading(false);
      }
    };
    
    loadBallot();
  }, [user, year]);
  
  if (loading) return <Loader />;
  
  return <div>{ballot.map(/* ... */)}</div>;
}
```

**Svelte (from this project):**
```svelte
<script>
  import { user } from '$lib/services/auth';
  import { ref, get } from 'firebase/database';
  import { db } from '$lib/services/auth';
  
  let ballot = [];
  let loading = true;
  
  onMount(async () => {
    if (!$user) {
      await goto('/login');
      return;
    }
    
    try {
      const ballotRef = ref(db, `/ballots/${YEAR}/${$user.uid}/votes`);
      const snapshot = await get(ballotRef);
      ballot = snapshot.val() || [];
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <Loader />
{:else}
  <div>{ballot.map(/* ... */)}</div>
{/if}
```

---

## Key Takeaways for React Developers

| React Concept | Svelte Equivalent |
|---------------|-------------------|
| `useState()` | Direct variable assignment + reactivity |
| `useEffect()` | `onMount()` + reactive statements (`$:`) |
| `useContext()` / Redux | Svelte Stores (`writable`, `readable`) |
| JSX expressions | Svelte template syntax (`{}`, `{#if}`, `{#each}`) |
| Props/callbacks | `export let` props + `bind:` for two-way binding |
| CSS Modules | Scoped `<style>` blocks (automatic) |
| Component tree re-renders | Targeted reactivity—only affected code runs |

### Performance Implications

1. **Smaller Bundle:** Svelte compiles away framework code—no Virtual DOM, no runtime overhead
2. **Faster Startup:** Less JavaScript to parse and execute
3. **Reactive by Default:** No need to manually track dependencies like `useEffect`
4. **True Locality:** Component state, styles, and markup together—easier to understand and maintain

---

## Resources

- [Svelte Official Docs](https://svelte.dev/)
- [SvelteKit Docs](https://kit.svelte.dev/)
- [Svelte Tutorial](https://svelte.dev/tutorial)
- [SvelteKit Tutorial](https://kit.svelte.dev/docs/introduction)
- [Svelte REPL](https://svelte.dev/repl) (Interactive playground)
