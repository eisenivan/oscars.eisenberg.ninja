# Plan

_Written 2026-11-09 on branch `2027-visual`. The earlier audit and visual-refresh plan moved to [AUDIT.md](AUDIT.md)._

| # | Feature | Status |
|---|---|---|
| A | Add a new season (year) from the admin panel | **Done** in this branch, needs a rules deploy |
| B | Database backups | **Done** (manual `npm run backup`); scheduling is optional, see B3 |
| C | Groups: anyone can run their own competition | **Planned**, steps below |

---

## A. Add a season from the admin panel ✅

**What changed**
- New page **`/admin`** (Account sheet → *Seasons*). It lists every season with Export / Edit / Results, and has an **Add a season** form. You paste or load a JSON file, see validation and a ballot preview, then confirm.
- `src-svelte/lib/domain/season.js` validates the file: unique slug ids, at least 2 nominees, no nominee-key clashes, no leftover `TODO`s. When you replace an existing year, it also lists the existing picks that would stop counting. Tested in `season.test.js`.
- The **current year now comes from the data**, not from code. It's the newest year under `settings/`. Creating 2027 makes it current for everyone with no deploy. `YEAR = 2026` is gone, and `currentYear` is a store in `queries.js`.
- Creating a season writes `groups/{year}` and `settings/{year}/locked = false` in one atomic update (`writeMany`). Replacing nominees leaves `locked` and `results` alone.
- `database.rules.json`: the ten copy-pasted year blocks are now `$year` wildcards, so future years need no rules change. Admins can write `groups/{year}`, which used to be `.write: false`. This also fixes audit §8: 2026 ballots were readable before lock.

**Before using it in production:** `npm run backup`, then `npm run deploy:rules`. The app deploy alone isn't enough: without the new rules, saving a season fails with `permission_denied`.

**Season file format:** see [`static/templates/season-template.json`](static/templates/season-template.json). It's also downloadable from the page.

```json
{
  "year": 2027,
  "categories": [
    {
      "id": "best-picture",
      "name": "Best Picture",
      "candidates": [
        { "text": "Film title", "subtext": "Producer names, Producers" },
        { "text": "Another film" }
      ]
    },
    {
      "id": "best-actress",
      "name": "Best Actress",
      "candidates": [{ "text": "Person name", "subtext": "Film title" }]
    }
  ]
}
```
- `id`: lowercase letters, numbers and dashes. Keep ids stable across years (`best-picture`, …). If you leave it out, it's generated from `name`.
- `text` is the main line and `subtext` is optional. Picks are stored as `<id>__<text lowercased, spaces removed>`, so **changing a nominee's `text` after voting starts orphans those picks**. The Replace flow warns you when that would happen.
- Category order in the file is the order on the ballot.
- A bare array of categories (the shape stored in the DB) is accepted too.

**Follow-ups (small)**
- [ ] Add a `draft` flag so a season can be staged without becoming current. Today, creating a season makes it current right away. That's fine if you create it after nominations are announced.
- [ ] Rules tests with the emulator. This needs Java locally (`brew install openjdk`) and `@firebase/rules-unit-testing`.

---

## B. Backups ✅

- `npm run backup` runs `firebase database:get /` with your CLI login, which bypasses the database rules. It writes `backups/eisenberg-oscars-<timestamp>.json` (git-ignored) and prints a per-year summary so a broken backup is obvious. If it fails with an auth error, run `firebase login --reauth`.
- Restore steps are in the README. Restoring overwrites data, so back up first.

**B3. Optional: scheduled backups** (pick one)
- [ ] **GitHub Action on a cron** that runs the same command with a service account, and pushes the JSON to a private storage bucket. Don't use workflow artifacts if the repo is public. Needs a service account with *Firebase Realtime Database Viewer*.
- [ ] **Firebase's built-in daily backups.** These need the Blaze plan: Console → Realtime Database → Backups. No code, and stored in Cloud Storage.

---

## C. Groups (multi-tenant competitions)

Goal: anyone can create a group from the home page by choosing a slug (e.g. `/g/smith-family`), invite people, and get their own leaderboard and all-time history. The Eisenberg competition becomes the first group.

### C0. Decisions to make first

1. **Naming collision.** `groups/{year}` already means *categories/nominees*. Recommendation: call the new thing **"groups" in the UI** but store it as **`leagues/`** in the database. Optionally migrate `groups/{year}` → `categories/{year}` later (see C9).
2. **One ballot per person per year, shared by all their groups** (recommended), or a separate ballot per group?
   - Shared: no ballot data migration, existing rules keep working, and you fill out one ballot. A group's leaderboard is the global ballots filtered to its members.
   - Per-group: `ballots/{league}/{year}/{uid}` is more flexible, but means a migration, rules rewrite, and filling out multiple ballots.
3. **Nominees and results stay global.** The Oscars are the same for everyone, and only site admins enter results. Group owners manage only their group.
4. **URL shape.** Recommended: `/g/{slug}/…`. Top-level `/{slug}` collides with `/login`, `/admin`, etc. and needs a reserved-word list forever.
5. **Joining.** Open (anyone with the link), or an invite code. Recommendation: an invite link with a secret code, regenerable by the owner.
6. **Who can create groups:** any signed-in user, or approved users only? This matters for abuse. Start with any signed-in user, with a cap of 5 groups per user (enforced by a cheap client-side check). Add moderation only if needed.

### C1. Data model

```
leagues/{slug}                 public read
  name: "Smith Family Oscars"
  ownerUid: "abc"
  createdAt: 1767225600000     (ServerValue.TIMESTAMP)
  description?: "..."

leagueSecrets/{slug}           owner read/write only
  inviteCode: "k3j9x2"

leagueMembers/{slug}/{uid}     members read; self-join with valid code; owner can remove
  displayName: "Ivan"          (denormalized for the member list)
  joinedAt: ...
  role: "owner" | "member"

userLeagues/{uid}/{slug}: true self read; written alongside membership (multi-path update)
```
- Slug rules: `^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])$` (3–32 chars). Also block a reserved list (`admin`, `new`, `api`, `www`, `oscars`, …) in the client and in rules.
- Global, unchanged: `settings/{year}`, `groups/{year}` (categories), `ballots/{year}/{uid}`, `admins/`.

### C2. Security rules (and rules tests)
- [ ] `leagues/$slug`: `.write` only when creating (`!data.exists() && newData.child('ownerUid').val() === auth.uid`), or when the existing owner updates it. `.validate` checks the slug regex and name length. Create is first-writer-wins, which makes slug uniqueness atomic.
- [ ] `leagueSecrets/$slug`: read/write only for the owner.
- [ ] `leagueMembers/$slug/$uid`:
  - Write your own membership when `newData.child('code').val() === root.child('leagueSecrets/'+$slug+'/inviteCode').val()`. Strip `code` afterwards, or validate it as write-only.
  - The owner can delete any member.
  - Members can read the member list.
- [ ] `userLeagues/$uid`: self only.
- [ ] Ballots: keep today's rule (readable by any signed-in user after lock). A group's leaderboard reads `ballots/{year}/{uid}` per member, which the per-uid rule already allows after lock. Before lock, people only ever see their own ballot, as now.
- [ ] Set up the emulator plus `@firebase/rules-unit-testing` (see A follow-ups) and write tests for: create, slug clash, join with a wrong code, owner removing a member, non-member reading members. **Ship nothing in C until these pass.**

### C3. Migrate the existing competition
- [ ] Script `scripts/migrate-eisenberg-league.js`, run with admin credentials after `npm run backup`:
  - create `leagues/eisenberg` with you as owner
  - add every uid that has ever had a ballot to `leagueMembers/eisenberg` and `userLeagues/{uid}`, using the latest `displayName`
- [ ] Add a `defaultLeague` setting (or hardcode `eisenberg`) so old URLs (`/`, `/scoreboard/2026`) keep working and redirect to `/g/eisenberg/…`.

### C4. Data layer and context
- [ ] `queries.js`: `leagueFor(slug)`, `membersFor(slug)`, `myLeagues(uid)`, `createLeague({slug, name})` (one multi-path `writeMany`: league, secret, owner membership, userLeagues), `joinLeague(slug, code)`, `leaveLeague`, `removeMember`, `regenerateInvite`, `slugAvailable(slug)`.
- [ ] `activeLeague` store, derived from `$page.params.slug` and mirroring `activeYear`.
- [ ] `ballotsForMembers(year, uids)`: combine per-uid `live()` stores into a `{uid: ballot}` map. RTDB multiplexes these listeners over one socket. Use it in place of `ballotsFor(year)` on group pages so a group never downloads other groups' ballots.
- [ ] `scoring.js` doesn't change. It already takes a `{uid: ballot}` map.

### C5. Routes
- [ ] Move year-scoped pages under `src-svelte/routes/g/[slug]/`:
  - `/g/[slug]`: the group's home (ballot for the current year)
  - `/g/[slug]/scoreboard/[year]` and `/[uid]`
  - `/g/[slug]/all-time`, which reads only member ballots (change `all-time/+page.svelte`, which currently reads `ballots/{year}` whole)
  - `/g/[slug]/settings`, owner only
- [ ] `/g/[slug]/join?code=…`: preview the group name, then Join. Sends signed-out users through login with `next=`.
- [ ] `nav.js`, `hrefForYear`, `YearSelect`, `StatusBanner`: add the slug prefix.
- [ ] Old routes redirect to the default league (C3).

### C6. Home page: create a group
- [ ] Signed out: the landing page gets a hero, "How it works", and two buttons, **Create a group** and **Sign in**.
- [ ] Signed in: a **My groups** list (from `userLeagues`) and a **Create a group** button. If you're in exactly one group, go straight to it.
- [ ] Create flow (sheet or `/new`):
  1. Group name, which fills in a suggested slug (`slugify` from `season.js`)
  2. Slug field with a live `oscars.eisenberg.ninja/g/<slug>` preview, a debounced availability check (`read('leagues/'+slug)`) and inline errors (too short, reserved, taken)
  3. Create. A rules-rejected create means someone took the slug first, so show "taken".
  4. Land on the group page with a **Share invite link** card (Web Share API, with a copy fallback).

### C7. Group owner settings (`/g/[slug]/settings`)
- [ ] Rename the group, edit the description
- [ ] Invite link: copy, regenerate (invalidates the old one)
- [ ] Members list: remove a member
- [ ] Transfer ownership; delete the group, with typed-slug confirmation (multi-path delete of `leagues`, `leagueSecrets`, `leagueMembers`, and each member's `userLeagues` entry)

### C8. Polish
- [ ] Per-group `<title>` and Open Graph tags (needs prerender or an edge function for link previews. Optional.)
- [ ] "Leave group" in the Account sheet
- [ ] The All-Time page shows the group's history only from when each member joined (or all years; decide)
- [ ] Empty states: a new group with no ballots, or a group with one member

### C9. Optional cleanup
- [ ] Rename `groups/{year}` → `categories/{year}`: copy, switch reads, deploy, then delete. This removes the naming collision for good.
- [ ] Store `votes` as a map keyed by category (AUDIT §12)

### Suggested order
C0 decisions → C2 rules plus tests → C1/C4 data layer → C3 migration (behind a backup) → C5 routes with redirects → C6 create flow → C7 settings → C8 polish. Each step from C5 onward can ship on its own once the redirects are in place.
