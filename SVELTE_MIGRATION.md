# Svelte Migration Guide

This application has been ported from React to Svelte/SvelteKit. Here's what's changed:

## Project Structure

- **Old**: `src/` (React with Create React App)
- **New**: `src-svelte/` (Svelte with SvelteKit)

## Key Changes

### File Organization
- `src-svelte/lib/` - Reusable components and utilities
- `src-svelte/routes/` - Page components and routing
- `src-svelte/app.html` - Main HTML template

### Dependencies
- Replaced `react` and `react-dom` with `svelte` and `@sveltejs/kit`
- Replaced `react-router-dom` with SvelteKit's built-in routing
- Upgraded `firebase` from v8 to v9 (modular SDK)
- Kept `tailwindcss` for styling

### Component Conversion

#### Login (Previously React)
```jsx
// React
function App() {
  const [isResetting, setIsResetting] = useState(false)
  return (
    <form onSubmit={login}>
      {/* form content */}
    </form>
  )
}
```

#### Login (Now Svelte)
```svelte
<!-- Svelte -->
<script>
  let isResetting = false
  
  const handleLogin = async (e) => {
    // login logic
  }
</script>

<form on:submit={handleLogin}>
  <!-- form content -->
</form>
```

### State Management
- **React Hooks** (`useState`, `useEffect`) → **Svelte Reactive Variables and Lifecycle**
- **Context API** → **Svelte Stores** (using `writable`)

### Routing
- **React Router DOM** → **SvelteKit File-based Routing**
  - `/login` → `src-svelte/routes/login/+page.svelte`
  - `/` → `src-svelte/routes/+page.svelte`
  - `/admin/:id` → `src-svelte/routes/admin/[id]/+page.svelte`

### Firebase
- **Old**: `firebase.initializeApp()` with database refs
- **New**: Modular Firebase SDK with `ref()`, `get()`, `set()`, `onValue()`

## Running the Application

### Development
```bash
npm install
npm run dev
```

### Building
```bash
npm run build
npm run preview
```

## Migration Checklist
- [x] Set up SvelteKit project structure
- [x] Convert Firebase service to modular SDK
- [x] Convert all React components to Svelte
- [x] Convert routing to SvelteKit
- [x] Set up Tailwind CSS
- [x] Migrate authentication flow
- [x] Migrate ballot voting logic
- [x] Migrate leaderboard
- [x] Migrate admin panel
- [x] Migrate profile management

## Breaking Changes
- No longer needs React runtime
- Store system is different (Svelte stores instead of Context API)
- Firebase API is modular and different
- Build output structure is different (standard SvelteKit output)

## Deployment
SvelteKit can be deployed to any Node.js server or serverless platform. See `svelte.config.js` for adapter options.
