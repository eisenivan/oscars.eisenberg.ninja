# React vs Svelte - Side by Side Comparison

## Example: Login Component

### React (Original)

```jsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { auth } from '../services/auth'
import PageHeading from '../components/PageHeading'

async function login (e) {
  e.preventDefault()
  const { email, password } = e.target.elements
  try {
    await auth().signInWithEmailAndPassword(email.value, password.value)
    window.location.href = '/'
  } catch (error) {
    console.warn(error)
  }
}

function App () {
  const [isResetting, setIsResetting] = useState(false)
  
  return (
    <div className={`w-full mt-2 max-w-xs m-auto bg-blue-100 p-5`}>
      <PageHeading>Login</PageHeading>
      { !isResetting ? (
        <form onSubmit={login}>
          <input type='text' name='email' />
          <input type='password' name='password' />
          <button type='submit'>Login</button>
          <button onClick={() => setIsResetting(true)}>
            Forgot Password?
          </button>
        </form>
      ) : (
        <form onSubmit={resetPassword}>
          {/* Reset form */}
        </form>
      )}
    </div>
  )
}

export default App
```

### Svelte (New)

```svelte
<script>
  import { goto } from '$app/navigation'
  import { signInWithEmail } from '$lib/services/auth'
  import PageHeading from '$lib/components/PageHeading.svelte'

  let isResetting = false
  let email = ''
  let password = ''

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      await signInWithEmail(email, password)
      await goto('/')
    } catch (err) {
      console.warn(err)
    }
  }
</script>

<div class="w-full mt-2 max-w-xs m-auto bg-blue-100 p-5">
  <PageHeading>Login</PageHeading>
  {#if !isResetting}
    <form on:submit={handleLogin}>
      <input type="text" bind:value={email} />
      <input type="password" bind:value={password} />
      <button type="submit">Login</button>
      <button type="button" on:click={() => isResetting = true}>
        Forgot Password?
      </button>
    </form>
  {:else}
    <form on:submit={handleResetPassword}>
      {/* Reset form */}
    </form>
  {/if}
</div>
```

## Key Differences

| Aspect | React | Svelte |
|--------|-------|--------|
| **State Declaration** | `const [state, setState] = useState(initial)` | `let state = initial` |
| **State Update** | `setState(newValue)` | `state = newValue` |
| **Effects** | `useEffect(() => {}, [deps])` | `onMount()`, `$:` reactive declarations |
| **Props** | `function Component({ prop }) {}` | `export let prop` |
| **Class Binding** | `className={condition ? 'class1' : 'class2'}` | `class={condition ? 'class1' : 'class2'}` or `class:name={condition}` |
| **Event Binding** | `onClick={handler}` | `on:click={handler}` |
| **Two-way Binding** | Need `useState` + `onChange` | `bind:value={variable}` |
| **Lists** | `.map()` with `key` | `{#each items as item (key)}...{/each}` |
| **Conditionals** | Ternary operator | `{#if condition}...{:else}...{/if}` |
| **Routing** | `<BrowserRouter><Route>` | File-based: `routes/path/+page.svelte` |
| **Context** | `createContext()`, `useContext()` | Svelte `stores` with `writable()` |
| **Component Files** | `.js` or `.jsx` | `.svelte` |

## Ballot Component Example

### React Logic

```javascript
const user = useSession()
const [ballot, setBallot] = useState([])

useEffect(() => {
  db.ref(`/ballots/${YEAR}/${user.uid}`).once('value').then((snapshot) => {
    setBallot(snapshot.val() || [])
  })
}, [user.uid])

function updateBallot(e) {
  const value = e.target.value
  const tempBallot = [...ballot]
  // ... logic
  db.ref(`ballots/${YEAR}/${user.uid}`).set({ votes: tempBallot }).then(() => {
    setBallot(tempBallot)
  })
}
```

### Svelte Logic

```javascript
let ballot = []

onMount(async () => {
  const ballotRef = ref(db, `/ballots/${YEAR}/${$user.uid}`)
  const snapshot = await get(ballotRef)
  ballot = snapshot.val() || []
})

const updateBallot = async (e) => {
  const value = e.target.value
  const tempBallot = [...ballot]
  // ... logic
  const ballotRef = ref(db, `ballots/${YEAR}/${$user.uid}`)
  await set(ballotRef, { votes: tempBallot })
  ballot = tempBallot
}
```

## Benefits of Svelte

✅ **Simpler syntax** - Less boilerplate, more readable
✅ **Smaller bundles** - Compiles to vanilla JavaScript
✅ **Better performance** - No virtual DOM overhead
✅ **Scoped CSS** - Styles automatically scoped to component
✅ **True reactivity** - `$` reactive declarations are elegant
✅ **Better TypeScript** - Native TypeScript support
✅ **Less mental overhead** - Simpler mental model

## Drawbacks to Consider

⚠️ **Smaller ecosystem** - Fewer third-party libraries than React
⚠️ **Learning curve** - Different paradigm from React
⚠️ **Less StackOverflow answers** - React is more popular
⚠️ **Limited job market** - React is more widely used

## Firebase SDK Changes

### React (v8)

```javascript
import firebase from 'firebase'
firebase.initializeApp(config)
const db = firebase.database()
db.ref('/path').once('value').then(snap => snap.val())
```

### Svelte (v9)

```javascript
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, get } from 'firebase/database'
initializeApp(config)
const db = getDatabase()
const snapshot = await get(ref(db, '/path'))
const value = snapshot.val()
```

## Event Handling

### React

```jsx
<button onClick={() => handler(value)}>Click</button>
<input onChange={(e) => setValue(e.target.value)} />
<form onSubmit={(e) => handleSubmit(e)}>
```

### Svelte

```svelte
<button on:click={() => handler(value)}>Click</button>
<input on:change={(e) => setValue(e.target.value)} />
<form on:submit={(e) => handleSubmit(e)}>
```

## Styling

### React (Inline styles)

```jsx
const styles = {
  button: {
    backgroundColor: 'blue',
    padding: '10px'
  }
}
<button style={styles.button}>Click</button>
```

### Svelte (Scoped CSS)

```svelte
<button>Click</button>

<style>
  button {
    background-color: blue;
    padding: 10px;
  }
</style>
```

All styles are scoped to this component by default!
