# Audit: oscars.eisenberg.ninja

_Audited 2026-11-09 against `main` @ `779975f`._

## Summary

The app is a small SvelteKit 1 / Svelte 3 single-page app (about 1.7k lines across 11 routes) built with `adapter-static` and backed by Firebase Auth and the Realtime Database (RTDB). It works, but the React→Svelte migration left a lot of debris behind. Most pages are written as self-contained "fetch in `onMount`, compute inline" components. That causes three kinds of problems:

1. **Real bugs hidden by the low traffic.** Listeners leak on every navigation, quick ballot clicks can drop picks, category matching uses substrings, and the leaderboard keys on display name instead of uid.
2. **Duplicated logic.** Scoring, ranking, the ballot grid, the auth guard and the nav-link styles are each copied 2–6 times.
3. **Stale foundations.** Every dependency is 1–4 major versions behind. There are no tests, lint or type checks. `public/` is never served (so there's no favicon), and the repo root has 10 obsolete migration docs.

None of this needs a rewrite. The plan below is ordered so each phase can ship on its own.

---

## P0: Correctness bugs (fix first)

### 1. `onMount(async …)` cleanup functions never run, so listeners leak
Svelte only uses a cleanup that `onMount` returns **synchronously**. An `async` callback returns a Promise, so the cleanup is silently thrown away.

- `src-svelte/routes/+page.svelte:26-61`: the `document` click listener and the `/settings/{year}` `onValue` subscription are never removed. Each visit to "My Ballot" adds another listener.
- `src-svelte/routes/scoreboard/[year]/+page.svelte:35-104`: the `/ballots/{year}` and `/settings/{year}` `onValue` listeners and the 5s timeout are never cleared. Moving between leaderboards stacks live subscriptions, and each one re-downloads the whole ballots node whenever anything changes. This is the biggest runtime cost in the app on Oscar night.
- `src-svelte/routes/admin/[id]/+page.svelte:55`: the `onValue` return value isn't even captured.

**Fix:** use a sync `onMount` that starts an async function and returns the cleanup, or use `onDestroy`. Better still, move subscriptions into a small store helper (see §8) that unsubscribes when its last subscriber goes away.

### 2. Quick clicks can drop ballot picks
`+page.svelte:115-135` builds `tempBallot` from `ballot`, awaits `set()`, and only then assigns `ballot = tempBallot`. If two radios are clicked before the first write resolves, both writes start from the same stale `ballot`, and the second one overwrites the first pick.

**Fix:** update local state optimistically before the `await`. Even better, write each category to its own path (`votes/{categoryId}` = candidateKey) so writes don't conflict at all. That needs a data-shape change (see §12).

### 3. Category matching uses substring search
Winners and votes are found with `x.indexOf(cat.id) > -1`:
- `+page.svelte:119` (`updateBallot`), `:207`
- `scoreboard/[year]/[uid]/+page.svelte:97,123`
- `admin/[id]/+page.svelte:80`

Keys look like `{categoryId}__{nomineekey}`, so any category id that appears inside another category id **or inside a nominee key** matches the wrong entry. For example, `actor` matches `supportingactor__…`, and `song` matches `score__songsofmyfather`. With the wrong match, `updateBallot` overwrites the pick for a different category. The `[uid]` page and `clearCategory` already do this correctly with `startsWith(`${id}__`)`.

**Fix:** add one helper, `categoryOf(key) => key.split('__')[0]`, and compare for equality everywhere.

### 4. Leaderboard and all-time stats are keyed by `displayName`, not uid
- `scoreboard/[year]/+page.svelte:172`: `{#each … (ballot.displayName)}` throws a duplicate-key error and breaks rendering if two people share a display name.
- `scoreboard/[year]/+page.svelte:175,179`: "is this me" highlighting compares display names.
- `all-time/+page.svelte:58-118`: scores, medals and history are aggregated by display name. If someone renames themselves, their history splits in two. If two people share a name, their records merge.

**Fix:** key and aggregate by `uid`, and use the most recent `displayName` for display only.

### 5. `displayName` is copied into every ballot and never updated
`+page.svelte:129` writes `displayName` into the ballot. `profile/+page.svelte:27` changes the auth display name but not existing ballots, so the leaderboard shows the old name until the user changes a vote. Either update the current year's ballot `displayName` on profile save, or keep a single `/users/{uid}/displayName` and join on read.

### 6. Profile page problems
- `profile/+page.svelte:31` calls `updateEmail`, which Firebase has deprecated. It fails with `operation-not-allowed` when email-enumeration protection is on (the default for new projects). Use `verifyBeforeUpdateEmail`.
- Errors are logged but never shown to the user (`:36-39`), so a failed save looks like a successful one.
- `if (!$user) goto('/login')` and the same pattern in `login`/`register` run at the top level of the script, which means they also run during SSR in dev. See §7.

### 7. The auth guard is racy and copied into every page
Every protected page repeats `if (!$user) goto('/login')` inside `onMount`. `+layout.ts` reads the store **once**, synchronously. On first load `initializing` is still `true`, so the redirect away from `/login` and `/register` never fires on a hard refresh. That's why the login and register pages have their own extra top-level `goto`.

**Fix:**
- Set `export const ssr = false` in `+layout.ts`. The site is a pure SPA served by the `fallback`, and SSR currently only runs in dev, where it causes trouble.
- Export an `authReady` promise from `auth.js` that resolves on the first `onAuthStateChanged` call.
- In `+layout.ts`, `await authReady`, then redirect in one place: unauthenticated users on non-public routes go to `/login`, and authenticated users on `/login` or `/register` go to `/`.
- Delete the 8 per-page guards and the `initializing` loader branch in `+layout.svelte`.

### 8. Rules: 2026 ballots can be read by anyone logged in before voting locks
`database.rules.json:39-45`: 2026 lets any authenticated user read every ballot whether or not voting is locked. It looks like this was loosened so the unlocked leaderboard ("N people have filled out ballots") could list names. Side effect: anyone can open the SDK or REST API and read everyone's picks before the ceremony. 2027+ still use the strict rule, so the unlocked leaderboard **will break next year**.

**Fix:** write a separate public node, such as `/participants/{year}/{uid}: displayName`, when a ballot is saved. The open leaderboard reads that node, and the `ballots` rules go back to "locked or owner". See §11 for the rules rewrite.

---

## P1: Maintainability

### 9. Pull domain logic out of components (`src-svelte/lib/`)
Scoring is written three times (`+page.svelte:137-145`, `scoreboard/[year]/+page.svelte:110-132`, `all-time/+page.svelte:56-87`). Tie-aware ranking is written twice. The "winner / ✓ / ✕ / resultClass" ternary chains are copied between `+page.svelte:207-211` and `[uid]/+page.svelte:123-128`. Suggested modules:

```
lib/
  firebase.js          # app/auth/db init only (rename from services/auth.js)
  auth.js              # user store, authReady, signIn/signUp/signOut/reset
  data/
    refs.js            # path builders: ballotRef(year, uid), settingsRef(year)…
    live.js            # liveValue(ref) -> readable store that unsubscribes itself
    queries.js         # getYears(), getCategories(year), getBallot(year, uid)…
  domain/
    keys.js            # candidateKey(cat, candidate), categoryOf(key)
    scoring.js         # scoreBallot(votes, results), rankBallots(list), medalTable(yearsData)
```

These are pure functions, so they're easy to unit test (§15) and they remove the substring bug class from §3.

### 10. Shared UI components
- **`BallotGrid` / `CategoryCard` / `CandidateRow`**: "My Ballot" (`+page.svelte:203-250`) and the view-someone's-ballot page (`[uid]/+page.svelte:121-173`) are near copies. The admin page renders the same structure with different inputs.
- **`NavLink`**: `Chrome.svelte` repeats the same 140-character class string 10 times (`:41-115`). The mobile menu also stays open after navigating; close it with `afterNavigate`.
- **`YearSelect`**: `+page.svelte:167-201` is a hand-built dropdown with a document click listener. A native `<select>` (or a `/ballot/[year]` route) is simpler and more accessible, and needs no listener.
- **Forms**: `login`, `register` and `profile` repeat the same input and button classes. Add a `TextField` and a `Button`, or Tailwind `@layer components` classes.
- Remove the unused `children` prop in `PageHeading.svelte:2` and accept `$$restProps`/`class` in `Loader.svelte`. `profile/+page.svelte:98` passes a `style` prop that's ignored.

### 11. Database rules: replace 10 copied blocks with wildcards and add validation
`database.rules.json` copies the same block for each year from 2021 to 2030, so it stops working in 2031, and 2026 has already drifted (§8). Replace it with:

```json
"ballots": {
  "$year": {
    ".read": "auth != null && root.child('settings/'+$year+'/locked').val() === true",
    "$uid": {
      ".read":  "auth != null && ($uid === auth.uid || root.child('settings/'+$year+'/locked').val() === true)",
      ".write": "$uid === auth.uid && root.child('settings/'+$year+'/locked').val() === false",
      ".validate": "newData.hasChildren(['displayName','votes'])",
      "displayName": { ".validate": "newData.isString() && newData.val().length <= 50" }
    }
  }
},
"groups": { ".read": true, "$year": { ".write": "root.child('admins/'+auth.uid).exists()" } }
```

- There's no `.validate` anywhere today, so any logged-in user can write any data, of any size, to their ballot.
- `scores/$uid` (`:75-80`) isn't used by any code. Remove it.
- Add a `firebase emulators:exec` rules test (§15), and deploy the rules from CI (§16) so they can't drift from the repo.

### 12. Data shape: store votes as a map keyed by category
Today `votes` is an array of `"cat__nominee"` strings, and every lookup scans it with `indexOf`/`find`. Storing `votes: { [categoryId]: nomineeKey }`, and `results` the same way:
- removes the substring matching entirely (§3),
- turns single-pick writes into `set(ref(db, `ballots/${y}/${uid}/votes/${cat}`), key)`, which fixes the race in §2,
- makes scoring `Object.entries(results).filter(([c, k]) => votes[c] === k).length`.

Migrate existing years with a one-off script, or write an `normalizeVotes()` adapter that accepts both formats so old years need no migration.

### 13. Project layout and leftover files
- **Rename `src-svelte/` → `src/`** and delete the `kit.files` overrides in `svelte.config.js`. The non-standard path confuses tooling and docs.
- **`public/` is never served.** SvelteKit serves `static/`. As a result `build/` has no favicon, no touch icons and no manifest (confirmed: `build/index.html` has no icon links). Move the files to `static/`, delete the CRA `public/index.html` and `manifest.json` (the manifest is still named "Create React App Sample"), and add `<link rel="icon">` to `app.html`.
- **Delete the migration docs**: `CLEANUP_SUMMARY.md`, `DOCS_INDEX.md`, `FILE_MANIFEST.md`, `MIGRATION_CHECKLIST.md`, `MIGRATION_COMPLETE.md`, `QUICK_START.md`, `REACT_VS_SVELTE.md`, `SVELTE_MIGRATION.md`, `SETUP_SVELTE.sh`, and possibly `svelte-for-react-devs.md`. Replace the Create React App `README.md` with a short README covering how to run it, how to add a new year (`/groups/{year}`, `/settings/{year}`, bump `YEAR`), how admin works, and how to deploy.
- **Remove empty `+page.ts` files** (`+page.ts`, `about/`, `profile/`, `scoreboard/`) and the unused `results: []` in `all-time/+page.ts`.
- Rename `admin/[id]` → `admin/[year]`, and drop the `console.log` that prints admin details (`admin/[id]/+page.svelte:30`).
- **Unused deps:** `@sveltejs/adapter-auto` and `@sveltejs/adapter-node`. `lodash.sortby` can be replaced with a native `sort` in two places. `package.json` `name` is `gamblor`.
- The `lint` script calls `eslint`, which isn't installed. The `format` script uses `--plugin-search-dir`, which was removed in Prettier 3.
- `tailwind.config.cjs` uses `export default` (ESM) in a `.cjs` file. It only works because Tailwind loads configs through jiti. Rename it to `tailwind.config.js`.
- `+layout.svelte:25-34` repeats global CSS that's already in `app.css`. `Chrome.svelte` has two `import … from '$lib/services/auth'` lines, and `handleLogout` dynamically imports `signOut` even though `auth.js` already exports one.

### 14. Make `YEAR` the only thing to change each season
`lib/constants.js` hard-codes `YEAR = 2026`, and the rules hard-code years. Add `settings/current: 2027` (or derive the current year from the highest key in `/settings`) so the yearly rollover is a data change, not a deploy. Add a short checklist for it to the README.

### 15. Tests and static checks
There are no tests today, and `vitest` is installed but unused.
- Add `jsconfig.json` with `checkJs` (or convert to TS; the `.ts` load files are already half-way there) and add `svelte-check` to CI.
- Unit-test `domain/scoring.js` and `keys.js`: ties, missing votes, partial results, renamed users.
- Test the rules with `@firebase/rules-unit-testing` against the emulator: locked vs. unlocked, owner vs. other user, admin writes.
- Install and configure ESLint (flat config with `eslint-plugin-svelte`) and Prettier 3.

### 16. CI/CD
- Update `actions/checkout` and `setup-node` from `@v3` to `@v4`/`@v5`.
- Add a `check` job (`npm run check && npm test && npm run lint`) that must pass before the deploy jobs.
- Deploy `database.rules.json` on merge (`firebase deploy --only database`). Right now rules are deployed by hand, which is how the drift in §8 can go unnoticed.

### 17. Dependency upgrades (do after §15 so tests can catch regressions)
| Package | Current | Latest |
|---|---|---|
| svelte | 3.59 | 5.x |
| @sveltejs/kit | 1.30 | 2.x |
| vite | 4.5 | 8.x |
| firebase | 9.23 | 13.x |
| tailwindcss | 3.4 | 4.x |
| adapter-static | 1.0 | 4.x |

Suggested order: Kit 2 + Vite 5 + adapter-static 3, then Svelte 5 (it still runs Svelte 4 syntax, so migrate components one at a time to runes), then Firebase, then Tailwind 4 (optional; v3 is fine). Moving off Svelte 3 / Kit 1 matters most because both are out of support.

---

## P2: Performance

The pages are small, so most of the cost is network and Firebase.

### 18. Firebase Hosting cache headers
`firebase.json` sets no `headers`, so the hashed files under `/_app/immutable/**` get Firebase's default 1-hour cache and every return visit revalidates them. Add:

```json
"headers": [
  { "source": "/_app/immutable/**", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
  { "source": "**/*.html",          "headers": [{ "key": "Cache-Control", "value": "no-cache" }] }
]
```

### 19. All-time page: one request per year, in sequence, downloading every ballot ever
`all-time/+page.svelte:40-108` `await`s `/ballots/{year}` one year at a time inside a `for` loop, and pulls every vote of every user for every year just to compute medals.
- **Quick win:** `Promise.all` the per-year fetches.
- **Real fix:** finished years never change. Save a summary for each year, e.g. `/standings/{year}: { uid: { displayName, score, rank } }`, written by the admin page when it locks or finalizes results (or by a Cloud Function). All-time then reads one small node. This also makes the leaderboard of a past year a single tiny read.

### 20. Live leaderboard: re-ranking on every event, in O(n²)
- `scoreboard/[year]/+page.svelte:62-96`: both listeners call `updateLeaderboard()`, which **mutates** `ballots[key].score` in place and rebuilds the ranking with `[...acc, x]` inside `reduce`, which is O(n²). Not an issue at n≈30, but it's easy to fix while extracting `rankBallots()` (§9): sort once, then assign ranks in a single loop.
- The `onValue('/ballots/{year}')` listener re-downloads **the whole node** on every change. On Oscar night, ballots don't change after lock. Use a one-time `get()` for ballots once locked, and keep live listeners only for `settings/{year}/results`.
- Remove the 5-second "safety timeout" (`:42-47`). With proper error callbacks it isn't needed, and it can hide a real failure behind an empty "No ballots yet".

### 21. Ballot page re-renders and repeated lookups
For each candidate, the template calls `keyFromName` (a regex), `results.indexOf`, `isSelected(ballot,…)` and `results.find`, and repeats the `hasBallot && locked && results.length > 0 && winner` chain four times per category. Precompute these once in a `$:` block (or `$derived` in Svelte 5):
- `voteByCategory` / `winnerByCategory` maps (free once §12 lands),
- `candidates` with `key` already computed,
- `showResults = hasBallot && locked && results.length > 0`.

The "My Ballot" page also re-fetches `/settings` and `/groups/{year}` on every visit. A cache in `lib/data/queries.js` keyed by year (groups never change after nominations) removes repeat reads when navigating around.

### 22. Bundle
The main chunk is about **396 KB raw / 85 KB gzip**, and almost all of it is the Firebase app, auth and database code, loaded on every route including `/login` and `/about`. Options, in order of value:
1. Leave it. It's already code-split per route, and with cache headers (§18) it downloads once.
2. Keep `firebase/database` out of the login, register and about routes by importing it only from `lib/data/*` (it's currently pulled in through `services/auth.js`).
3. The dynamic `import('firebase/auth')` calls in `auth.js:50-63`, `Chrome.svelte:10` and `login/+page.svelte:28-29` save nothing, because `auth.js` already imports `firebase/auth` statically. Remove them for simplicity.

### 23. Theme flash (FOUC)
`stores/theme.js` adds the `dark` class only after the JS bundle runs, so dark-mode users see a white flash on every hard load. Add a 3-line inline script in `app.html` `<head>` that reads `localStorage.theme` and `prefers-color-scheme` before first paint. Also simplify `toggle()`: the `subscribe(...)()` trick can just be `update(v => !v)` plus a subscriber that applies the theme.

---

## P3: Accessibility and UX polish (low effort, worth bundling in)
- `all-time/+page.svelte:201-219`: sortable `<th>` cells use `on:click` with no button and no `aria-sort`. Put a `<button>` inside each header.
- `all-time/+page.svelte:278` sorts `history` in place inside the template, mutating the data on every render. Sort once when building the data.
- `all-time/+page.svelte:296-300`: the backdrop `div` has `on:keydown` but can't receive focus, so Escape never fires. Use `<svelte:window on:keydown>`.
- The hamburger button in `Chrome.svelte:22` has no `aria-label` or `aria-expanded`.
- The `Loader` has no accessible label (`role="status"` / `aria-label="Loading"`).
- `login/+page.svelte:98` shows every message, including errors, in green on the reset screen because `error` is reused for success. Split it into `error` and `notice`.
- The login email input is `type="text"`. Change it to `type="email"` with `autocomplete` attributes on all auth forms.

---

## Suggested sequencing

| Phase | Scope | Size |
|---|---|---|
| 1 | §1–4 (listener leaks, race, substring match, uid keys), §18 (cache headers), §13 asset fix (`public/`→`static/`) | ~1 day |
| 2 | §7 central auth guard + `ssr=false`; §9 `lib/domain` + `lib/data` extraction with unit tests (§15) | 1–2 days |
| 3 | §8/§11 rules rewrite + `participants` node + rules tests + CI deploy (§16) | ~1 day. **Must ship before 2027 voting opens** |
| 4 | §10 shared components, §13 repo cleanup, §14 current-year in data | ~1 day |
| 5 | §12 votes-as-map migration, §19 precomputed standings, §20–21 perf | 1–2 days |
| 6 | §17 dependency upgrades (Kit 2 → Svelte 5 → Firebase), §22–23, P3 polish | 2–3 days |

---
---

# Part 2: Visual refresh and UX plan

_Design review written 2026-11-09. Part 1 above is the engineering audit. Many items here rely on the component extraction in §9–10, so it makes sense to do them together._

## What's wrong with the current UI

| Problem | Where | Effect |
|---|---|---|
| Generic Tailwind blue everywhere (`bg-blue-700` nav, `bg-blue-100` cards, `border-8 border-opacity-10` frames) | everywhere | Looks like a template. Nothing says "Oscars". |
| Tiny native radio buttons inside thin left-border labels | `+page.svelte:220-247` | The main task (picking ~23 categories on a phone) has 16px tap targets. |
| No sign of progress or saving | ballot page | Users can't tell how many categories they've filled in, or whether a pick saved. Saves happen with no feedback, and failures don't show at all. |
| Hamburger menu holding 6 items | `Chrome.svelte` | On mobile the main sections are hidden behind a tap, and the menu doesn't close after you navigate. |
| Everything is UPPERCASE (categories, nominees, nav) | ballot, nav | Harder to read nominee names and subtexts. |
| Results shown only with colored ✓/✕ text and green/red labels | ballot, compare | Low contrast and depends on color alone. Winner, your pick and correct/incorrect blur together. |
| A wide table on mobile, with history in a floating tooltip positioned by mouse coordinates | `all-time` | Scrolls sideways on phones, and the tooltip can render off-screen. |
| Global `section:hover` shadow and a dotted background pattern | `app.css:9-68` | Hover effects on things you can't click, plus visual noise. |
| Inconsistent buttons (`hover:bg-pink-700` on login, `hover:bg-indigo-700` on profile) | auth pages | Looks unfinished. |
| A rotating clock SVG as the only loading state | `Loader.svelte` | The layout jumps when content arrives, and the loader has no accessible label. |
| Dark mode added with `dark:` overrides one by one | everywhere | Some combinations are missing (e.g. `dark:text-gray-900` on blue rows in the leaderboard). The theme flashes on load. |

---

## 1. Design direction: "Ceremony night"

The site gets used **on Oscar night, on phones, in a living room, often in low light**, and on desktop during nominations. Design for that moment:

- **Dark as the main theme, light as a full equal.** The default still follows the system setting, but dark is where the design is most considered.
- **Gold used sparingly.** Gold marks only the things that matter: your pick, winners, rank #1 and the main button. Everything else is neutral and warm.
- **Editorial type.** A serif display face for headings and names gives the ceremony feel. UI text uses a clean sans-serif with tabular numbers for scores.
- **Big tap targets, short screens, one thing per screen on mobile.** More screen space on larger displays adds columns and side panels instead of stretching content.

## 2. Design tokens

Define these as CSS custom properties in `app.css` and map them in `tailwind.config` (`colors: { bg: 'rgb(var(--bg) / <alpha-value>)', … }`). Components then use `bg-surface text-fg border-line` and **never** use `dark:` classes. The theme switches by swapping variables on `html.dark`.

### Color

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#FAF7F0` (paper) | `#0E0D0B` (ink) | page |
| `--surface` | `#FFFFFF` | `#181612` | cards |
| `--surface-2` | `#F2EDE2` | `#221F19` | inset / hover / selected rows |
| `--line` | `#E4DCCB` | `#2E2A22` | borders, dividers |
| `--fg` | `#1A1814` | `#F3EEE3` | primary text |
| `--fg-muted` | `#6B6355` | `#A39A88` | secondary text, subtext |
| `--gold` | `#8A6A12` (text-safe, 5.3:1 on paper) | `#E3C46B` | accent text, icons |
| `--gold-fill` | `#C9A227` | `#C9A227` | buttons, selected indicator, #1 |
| `--on-gold` | `#1A1814` | `#1A1814` | text on gold |
| `--success` | `#1F7A4D` | `#5CC48E` | correct pick |
| `--danger` | `#B3261E` | `#F2867E` | wrong pick, errors |
| `--info` | `#2B5A9E` | `#8DB4F0` | "my pick" in compare view |

Check every text/background pair for WCAG AA (4.5:1 body, 3:1 large text and UI). Light-mode gold text uses the darker `#8A6A12` because `#C9A227` on white fails.

### Typography
- **Display:** *Fraunces* (variable, opsz). Use it for page titles, category names, leaderboard names and the logo. Self-host with `@fontsource-variable/fraunces` so there's no Google Fonts round-trip and nothing to block the first paint.
- **UI:** *Inter* (variable) or the system font stack. Use `font-feature-settings: "tnum"` for scores and ranks.
- **Scale (mobile → ≥1024px):** `display 32→48`, `h1 26→36`, `h2 19→22`, `body 16` (never smaller on inputs, so iOS doesn't zoom), `small 14`, `caption 12`. Use sentence case for nominees and small-caps tracking only for category labels (`text-xs tracking-[.14em] uppercase text-fg-muted`).

### Space, radius, elevation, motion
- 4px base spacing. Mobile page gutter is 16px, rising to 24px at ≥640px and 32px at ≥1024px.
- Radius: `--r-sm 8px` for chips and inputs, `--r-md 14px` for cards, `--r-lg 20px` for sheets.
- Elevation: in dark mode, show depth with surface color steps rather than shadows. In light mode, use a single soft shadow `0 1px 2px rgb(0 0 0/.06), 0 4px 16px rgb(0 0 0/.04)`. Only clickable cards get a hover shadow.
- Motion: 150ms ease-out for state changes and 250ms for sheets. Use Svelte `flip` for leaderboard reordering. Respect `prefers-reduced-motion`.
- Remove the dot-pattern background, the global `section` styling, `.card-polish`, `.bg-pattern-*`, the `noise` class and the CSS transitions on `body` and headings.

## 3. App shell and navigation

### Mobile (<1024px): bottom tab bar
```
┌──────────────────────────────┐
│ ★ Oscars          2026 ▾  ◐ │  ← slim top bar: wordmark, year, theme
├──────────────────────────────┤
│                              │
│         page content         │
│                              │
├──────────────────────────────┤
│  ✎ Ballot  🏆 Board  ◎ All  ☰│  ← fixed bottom tabs, 56px + safe-area
└──────────────────────────────┘
```
- There are 4 tabs: **Ballot**, **Leaderboard**, **All-Time**, **More**. More opens a sheet with Profile, About, Theme and Log out.
- The current tab gets a gold icon and label. Icons are inline SVG (Lucide set) instead of emoji, so they render the same on every platform.
- Add `padding-bottom: env(safe-area-inset-bottom)`, plus `viewport-fit=cover` in `app.html`.
- When logged out, there's no tab bar; auth pages are full-screen.

### Desktop (≥1024px): top bar
```
┌────────────────────────────────────────────────────────────────┐
│ ★ Oscars // Eisenberg     Ballot  Leaderboard  All-Time   2026▾ ◐ (IE)│
└────────────────────────────────────────────────────────────────┘
```
- Inline links with a gold underline on the active one. An avatar initial on the right opens a menu with Profile, About and Log out.
- Content width: `max-w-6xl` (1152px) for most pages, `max-w-7xl` for the ballot grid.

### Year as global context
The year picker in the top bar replaces the custom dropdown on the ballot page (`+page.svelte:167-201`) and the separate `/scoreboard` year-list page. Routes become `/[year]/ballot`, `/[year]/leaderboard` and `/[year]/ballot/[uid]`, with the current year as the default. On mobile it's a native `<select>` styled as a chip, which gets the OS picker for free.

### Status banner
A slim strip under the top bar on every in-app page, showing the year's state:
- **Open:** "Voting open · 14 of 23 picked" (gold dot), linking to the first category without a pick.
- **Locked, no results yet:** "Voting closed · waiting for the first envelope".
- **Live:** "● Live · 9 of 23 announced · Latest: Best Sound → *Dune: Part Two*", with a pulsing dot.
- **Final:** "Final results · You placed #3".

## 4. My Ballot (the main screen)

### Mobile
```
┌──────────────────────────────┐
│ My Ballot                    │
│ ▓▓▓▓▓▓▓▓▓░░░░░░  14 / 23     │  ← progress, sticky under top bar
│ [Picture][Director][Actor]…▸ │  ← sticky chip rail, ✓ on done ones
├──────────────────────────────┤
│ BEST PICTURE                 │  ← small-caps label
│ ┌──────────────────────────┐ │
│ │ ◉ Anora                  │ │  ← selected: gold ring + fill, 56px+
│ │   Sean Baker, producers  │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ ○ The Brutalist          │ │
│ └──────────────────────────┘ │
│  …                           │
│               Saved ✓        │  ← inline save status for this card
└──────────────────────────────┘
```
- **Nominee rows are the tap target.** Each is a full-width card with at least 56px height, the title in the body font at 16px/600 and the subtext at 14px in muted color. Keep a real `<input type="radio">` for accessibility, visually replaced by a 22px custom indicator. When selected, the row gets a `--gold-fill` ring, a `--surface-2` background and a filled indicator.
- **Auto-advance (optional, on by default):** after picking, scroll smoothly to the next category without a pick (within ~400ms, and only if that category is below the fold). A "Jump to next empty" floating button appears when there are gaps.
- **Save feedback for each category:** a small "Saving…" then "Saved ✓" label in the category header. On failure the row goes back to its previous value and an error toast with a **Retry** button appears. This depends on the optimistic write in Part 1 §2.
- **Chip rail:** a horizontally scrollable, sticky list of category short-names. Tapping one scrolls to that category, and an IntersectionObserver highlights the chip for the category in view. Completed categories get a ✓.
- **Read-only states** (locked, or a past year): the rows lose their indicators, and only your pick shows a "Your pick" label. A lock icon and line, "Voting closed Mar 2, 7:00 PM", appear above the list.

### Results mode (locked, with results announced)
Each category card shows its result in the header and uses **shape and text as well as color**:
```
BEST SOUND                       ✓ Correct      ← success pill
┌────────────────────────────┐
│ 🏆 Dune: Part Two   Winner │  ← winner row: gold left bar + trophy icon
│    Your pick ✓             │
└────────────────────────────┘
  A Complete Unknown            ← other nominees collapse to a muted list
  Emilia Pérez                    (tap "show all" to expand)
```
- Wrong pick: a red "✕ Missed" pill in the header. Your pick has a strikethrough-free "Your pick" label in danger color, and the winner row is highlighted.
- Categories not announced yet keep the normal layout, with your pick highlighted and a "Pending" pill.
- A score summary card at the top shows **`9 / 14` correct**, a ring chart and your current rank, linking to the leaderboard.

### Tablet and desktop
- **640–1023px:** category cards in 2 columns. The chip rail is still sticky.
- **≥1024px:** two-pane layout. A sticky **left sidebar (260px)** lists every category with ✓ or a result pill, plus the progress bar and score card. The main area is a masonry-style **2-column** grid of category cards (**3 columns ≥1440px**). Use CSS `columns` or `grid-template-rows: masonry` with a fallback, so short categories don't leave gaps.
- Keyboard support: arrow keys move within a category (native radio-group behavior), and `J`/`K` jump between categories.

## 5. Leaderboard

### Mobile
```
┌──────────────────────────────┐
│ Leaderboard 2026   ● Live    │
│ 9 of 23 announced            │
│   ┌───┐                      │
│ ┌─┤ 1 ├─┐                    │  ← podium: top 3 as avatars + names
│ │2│Ivan │3│                  │     (circle initials, gold/silver/bronze rings)
│ └─┴─────┴─┘                  │
├──────────────────────────────┤
│ 4  Sarah        ▓▓▓▓▓░░  7   │  ← row: rank, name, bar = score/announced, score
│ 5  Dan          ▓▓▓▓░░░  6   │
│ 5  Mia          ▓▓▓▓░░░  6   │  ← ties share the rank and show "T-5"
│ …                            │
├──────────────────────────────┤
│ 12 You (Ivan)   ▓▓▓░░░░  5   │  ← "you" row pinned to the bottom when off-screen
└──────────────────────────────┘
```
- Rows are at least 52px tall, and the whole row links to that person's ballot once voting is locked. Show a chevron to make that clear.
- Rank changes use `animate:flip`, with a small ▲2 / ▼1 delta badge for 5 seconds after each result comes in.
- **Before lock:** replace the board with a "Who's in" grid of initials, plus a count ("18 ballots submitted") and a "Your ballot: 14/23" reminder. Don't rank anyone.
- **"Latest result" toast:** when a new result arrives, slide in "Best Sound → *Dune: Part Two* · 11 of 18 got it", then dismiss it automatically. This is the most fun moment of the night, so design for it.

### Desktop (≥1024px)
A two-column split: the **standings (7/12)** on the left and the **results feed (5/12)** on the right. The feed lists announced categories newest first, each with the winner and the percentage who picked it. Clicking a feed item opens a popover listing who got it right. The podium becomes a wider horizontal hero.

## 6. View or compare a ballot (`/[year]/ballot/[uid]`)
- **Header:** the person's name in display type, their rank and score, and "← Leaderboard".
- **Compare** becomes a segmented control instead of a checkbox: `Their ballot | Compare with mine | Only differences`.
- **Mobile compare:** each category card shows two compact lines, "Them: X" and "You: Y", with the winner marked. Matching picks collapse into one line, "Both: X ✓". A "12 same · 6 different · 5 pending" summary bar sits at the top.
- **Desktop compare:** a two-column table for each category (Them | You) with a shared winner highlight and sticky name headers. Cards that differ get an `--info` left border instead of the yellow background.

## 7. All-Time
- **Mobile:** replace the table with ranked cards: rank, name, three medal counts (🥇 shown as SVG medal glyphs with numbers), points, and a sparkline of finishing positions by year. Tapping a card opens a **bottom sheet** with the year-by-year history, replacing the coordinate-positioned tooltip.
- Sorting on mobile: a "Sort by: Points ▾" select above the list.
- **Desktop:** keep the table with proper `<button>` sort headers and `aria-sort`, sticky header, tabular numbers, zebra rows done with `--surface-2`, and an expandable row (or right-side drawer) for history. Add a small "Hall of Champions" strip above it: each year's winner, scrolling horizontally.

## 8. Auth and profile
- Full-screen centered card, max width 400px. The wordmark and a subtle gold gradient spotlight sit behind it (CSS radial-gradient, no image).
- Inputs are 48px tall, labels sit above the field, there's a visible focus ring (`--gold-fill`, 2px offset), and errors appear under the field in danger color with an icon.
- Use correct `type`/`autocomplete` attributes (`email`, `current-password`, `new-password`, `nickname`). Add a **show-password** toggle. On register, show match status inline.
- **One button system:** `primary` (gold fill, ink text), `secondary` (surface + line border), `ghost` (text only), `danger`. All are at least 44px tall and full width on mobile. Loading state shows an inline spinner and keeps the button width the same.
- Forgot-password becomes its own lightweight view with success shown as a separate notice, not the same red/green error text.
- Profile: sections for **Display name** (with a live preview: "Shows on the leaderboard as **Ivan E.**"), **Email** (explaining the verify-before-change flow), **Password reset**, **Theme** (System / Light / Dark segmented control) and **Log out**.

## 9. Admin (results entry on the night)
Designed for one person entering results quickly on a phone during the broadcast:
- A big **Voting open / Closed** switch at the top, with a confirm dialog.
- Category list with announced and pending sections. Tapping a category opens a sheet with large nominee buttons, and tapping one sets the winner, closes the sheet and shows an **Undo** toast for 6 seconds. This replaces the always-visible "Clear" buttons.
- "Next unannounced category" is pinned as the main action, because categories are announced in a fairly predictable order.

## 10. Loading, empty and error states
- Replace `Loader.svelte` with **skeletons** that match each layout: category card skeletons and leaderboard row skeletons with a shimmer, which is turned off under reduced-motion. This avoids layout jumps. Keep a small spinner only for buttons.
- Empty states get an illustration-free icon, one line of text and an action. For example: "No ballots yet for 2027 · Be the first → Fill out ballot".
- Errors use a toast for temporary failures (with Retry) and an inline card for failed page loads. Never use `console.error` alone.
- When offline, a banner says "You're offline. Picks will save when you reconnect." (RTDB queues writes, so say that.)

## 11. Responsive strategy summary

| Breakpoint | Shell | Ballot | Leaderboard | All-Time |
|---|---|---|---|---|
| <640 | top bar + bottom tabs | 1 col, chip rail, auto-advance | podium + list, pinned "you" row | cards + bottom sheet |
| 640–1023 | same, larger gutters | 2-col cards | list wider, podium inline | cards 2-col |
| 1024–1439 | top nav | sidebar + 2-col masonry | standings + results feed | table + drawer |
| ≥1440 | top nav, `max-w-7xl` | sidebar + 3-col | same, larger podium | table + champions strip |

Design and build mobile-first. Test at 360×640 (small Android), 390×844 (iPhone), 768×1024, 1280×800 and 1920×1080. Also check landscape on phones: the chip rail and status banner should collapse together when height is under 500px.

## 12. Accessibility baseline (part of every item above)
- All text/background pairs meet AA contrast. Focus is always visible with `:focus-visible` rings. Tap targets are at least 44px.
- State is never shown by color alone; always use an icon or text (✓ Correct, ✕ Missed, 🏆 Winner, "Your pick").
- Use semantic structure: `<fieldset><legend>` for each category, `role="status"` / `aria-live="polite"` for save state and new results, and a skip-link to main content.
- The theme initializes before first paint (Part 1 §23). Update `<meta name="theme-color">` per theme (`#0E0D0B` / `#FAF7F0`).

## 13. Polish that makes it feel finished
- **PWA:** a proper `manifest.webmanifest` (name "Eisenberg Oscars", ink background, gold icon) plus iOS meta tags, so guests can "Add to Home Screen" on party night and get a full-screen app. Redraw the favicon and app icon as a minimal gold statuette/star mark on ink.
- Haptics: `navigator.vibrate(10)` on pick, Android only (and never under reduced-motion).
- A one-time confetti burst (CSS, about 1KB, reduced-motion aware) when you get Best Picture right or finish #1.
- Social preview: `og:image` and `og:title` so links shared in the family group chat look good.

## 14. Implementation order

| Step | Work | Depends on |
|---|---|---|
| D1 | Tokens in `app.css` + Tailwind theme; fonts self-hosted; remove old global CSS; theme init script | — |
| D2 | Base components: `Button`, `TextField`, `Card`, `Chip`, `Pill`, `Sheet`, `Toast`, `Skeleton`, `Icon` | D1 |
| D3 | App shell: top bar, bottom tabs, status banner, year context + route restructure | D2, Part 1 §7 |
| D4 | Ballot: `CategoryCard` / `NomineeOption`, progress, chip rail, save states, results mode, desktop sidebar | D2–3, Part 1 §2, §9–10, §12 |
| D5 | Leaderboard: podium, rows, flip animation, pinned "you" row, results feed, latest-result toast | D2–3, Part 1 §4, §20 |
| D6 | Compare view, All-Time cards and table, auth and profile, admin sheet flow | D2–5 |
| D7 | Skeletons and empty/error states, PWA/icons/OG, accessibility pass (axe + VoiceOver/TalkBack), device QA matrix | all |

Aim to finish D1–D5 before the 2027 nominations announcement (late January), so there's a full voting period to find problems before ceremony night.
