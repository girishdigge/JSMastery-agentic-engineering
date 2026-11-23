# Demo Brief: Lessons 2.1 + 2.3 — Shared Base App

**Stack:** Next.js 16 + TypeScript (use whatever the current stable patch is when you build this, don't pin to an old version)

**Why these two share an app:** Both lessons are about exploring and debugging the same codebase. 2.1 watches an agent diagnose a bug through the read, decide, act, observe loop. 2.3 watches it answer "where is X handled" through search and read. A viewer who just watched 2.1 recognizes the app in 2.3, no re-orientation needed.

---

## The App Concept

A small task manager. Login screen, a dashboard listing tasks, add/complete/remove a task. Nothing more. The entire point of this app is to be small enough to read in one sitting and realistic enough that watching an agent explore it doesn't feel like a toy.

Rough shape:

- A login page with email/password
- A dashboard, protected, listing tasks
- Basic task CRUD (add, toggle complete, remove)
- A simple session mechanism (a cookie is enough, this doesn't need real security)

You don't need a real database. In-memory storage is fine, the point isn't persistence, it's having a codebase an agent can search and reason about.

---

## Lesson 2.1 — The Agent Loop

### The Objective

The viewer needs to watch an agent go through the loop from lesson 2.1's script: read, decide, act, observe, and see it repeat at least twice, ideally with a freeze-frame moment on one full cycle.

### The Bug You Need to Build In

The login button should silently do nothing when clicked. No error message, no console error, no redirect. Just... nothing.

**Why silent matters:** a bug that throws a visible error is boring to diagnose, the agent just reads the stack trace. The lesson needs a bug that requires the agent to actually explore, form a hypothesis, and verify it, because there's no error message pointing at the answer.

**The mechanism I'd suggest:** somewhere in your auth logic, have a handler or function get renamed (simulate this as if it happened during a refactor), but leave one reference to the old name somewhere else in the codebase, in a way that fails quietly rather than throwing.

A pattern that works well for this: a handler registry (an object mapping string keys to functions), looked up with optional chaining. If the key doesn't exist, the lookup returns `undefined`, the optional chaining means calling it just does nothing, and no error surfaces anywhere. This is a real pattern you'll see in actual codebases (command registries, action maps, keyboard shortcut handlers), so it won't feel contrived.

**Important constraint:** this bug must NOT get caught by TypeScript at build time. If you type the registry as `Record<string, YourFunctionType>`, indexing it with a string key that doesn't exist still type-checks fine under normal TypeScript settings, since TypeScript can't know at compile time whether a given string key exists in the object. Confirm this by running a full build after you've written the bug in, it should complete with zero errors. If it doesn't, the bug is in the wrong place, move it out of anything TypeScript can statically verify.

### The Demo Prompt

> "The login button on this app doesn't seem to do anything when I click it. Can you figure out why?"

### What to Capture on Camera

1. Agent searches (greps) for something related to login or auth
2. Opens a file, forms a hypothesis
3. Opens a second file, the one with the actual mismatch
4. Identifies the gap, ideally after at least one more back-and-forth confirming it before proposing the fix

The freeze-frame moment for the script is right after it identifies the mismatch, before it fixes it, that's the beat where you pause and point out "this is one full loop."

---

## Lesson 2.3 — How It Reads Your Codebase

### The Objective

Watch an agent answer a "where is X handled" question through genuine search and read, not through already knowing the answer. This only works if it hasn't already explored the relevant files earlier in the same session, so either run this in a fresh session, or ask a question about a part of the app it hasn't touched yet.

### The Naming Requirement

This is the one non-negotiable constraint for this lesson: your auth-related files need to be clearly, obviously named. Whatever you call your session handling, your auth logic, your protected-route logic, the names need to make "auth" or "session" or "login" grep-able in an obvious way.

**Why this matters:** the lesson's whole point is that clear naming makes the agent's search fast and accurate, and bad naming makes it slow and uncertain. If you name things obscurely "for realism," you've actually broken the lesson, since it needs to demonstrate the payoff of good naming, not the cost of bad naming. (A bad-naming demo is a different, separate asset, for the Legacy Codebase module later, don't conflate the two.)

### The Demo Prompt

> "Where is auth handled in this project?"

### What to Capture on Camera

1. A grep for "auth" (or similar)
2. Multiple files coming back
3. The agent filtering, deciding which one or two are actually worth opening
4. A specific, accurate answer citing real file names

This should be fast and clean. If the agent seems to wander or open a lot of irrelevant files, that's a signal your naming isn't clear enough yet, fix the naming rather than accepting a messier demo.

---

## Quick Sanity Checklist Before Recording

- [ ] Full build passes with zero TypeScript errors (confirms the 2.1 bug is genuinely silent, not compiler-visible)
- [ ] Clicking login with correct credentials does nothing, no error, no redirect, no console output
- [ ] The backend auth logic itself is correct if called directly (so you can prove the bug is in one specific place, not everywhere)
- [ ] Auth-related files are clearly named enough that a fresh agent session can find them in one or two greps
- [ ] The app is small enough that you could explain every file in it in under two minutes
