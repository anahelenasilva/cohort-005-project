# Giving the agent a browser

This is how you drive a page in the app, and ask it questions.

It uses [agent-browser](https://github.com/vercel-labs/agent-browser), a CLI
built for exactly this — one command per action, an answer on stdout.

## Once, per machine

```bash
npm install -g agent-browser
agent-browser install
```

## Asking your own question

Start the app with `npm run dev` first. The examples below use
`http://localhost:5173`, the dev server's default address — if `npm run dev`
printed a different one, use that. Wait for it with
`until curl -s localhost:5173 >/dev/null; do sleep 1; done` rather than a
fixed sleep.

### Sign in as a seeded user

Most pages need a user. The DevUI panel signs one in through
`POST /api/switch-user` (`app/routes/api.switch-user.ts`), so post to it
from the page:

```bash
agent-browser open http://localhost:5173/
agent-browser eval 'fetch("/api/switch-user", {method: "POST", body: new URLSearchParams({userId: "5"})}).then((r) => r.status)'
agent-browser open http://localhost:5173/courses/introduction-to-typescript/lessons/1
```

In the seed, user 1 is Alex Rivera (admin), user 2 is Sarah Chen (instructor),
user 5 is Emma Wilson, a student enrolled in `introduction-to-typescript`,
whose first lesson is 1, and user 10 is Bossy McBossface, a student with no
enrollments, for the locked view of a lesson. Run `sqlite3 data.db "select id, name, role from users"`
for the rest.

### Read the DOM

A screenshot is pixels. To verify a fix you need a yes or a no, so read the
DOM:

```bash
agent-browser open http://localhost:5173/courses
agent-browser find placeholder "Search courses..." fill "typescript"
agent-browser find role button click --name "Search"

# Did the search reach the URL?
agent-browser get url

# How many course cards came back?
agent-browser get count 'a[href^="/courses/"]'

# What does the empty state say, if there is one?
agent-browser get text main

# Did anything break?
agent-browser errors
agent-browser console
```

The commands worth knowing: `open`, `click`, `fill`,
`find <role|text|label|placeholder> …`, `wait`, `get text|html|attr|count|url`,
`is visible|enabled|checked`, `eval`, `snapshot` (the accessibility tree, with
refs), `screenshot`, `console`, `errors`, `close`. `agent-browser --help` has
the rest.

**Ask the page, do not ask the person.** A change you have not looked at is a
change you are reporting on trust.

Screenshots are PR evidence: a before and an after for a change that shows in
the UI.

## Three things that will bite you

**Hydration lags "networkidle".** The button is in the server HTML before
React attaches its `onClick`, so the first click can be a silent no-op. Poll
for the click's effect and click again, rather than waiting a fixed time.

**Vite re-optimizes on the first load.** On a fresh checkout, the first page
load discovers dependencies Vite has not pre-bundled, and pushes a full-page
reload a moment after the response has finished. Absorb it once against a
throwaway load before the real loop; otherwise it lands mid-interaction and
every click after it hits a page that is already navigating away.

**`fill ""` does not clear a React input.** The DOM goes empty, but React's
`onChange` never fires, so the component keeps the old value, and later key
presses cannot bring the two back in step. Clear with real keys:
`agent-browser click <selector>`, `agent-browser press Control+a`,
`agent-browser press Delete`. If a `fill ""` already ran, `agent-browser reload`
first.
