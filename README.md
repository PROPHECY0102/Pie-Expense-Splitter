# Pie 🥧

> An expense splitter for friends, roommates, and travel buddies — built for the Shortcut Asia Internship Challenge 2026.

Pie tracks shared expenses for any group of people: a trip, a household, a weekly dinner. It auto-splits bills four ways (equal, exact, percentage, or shares), shows everyone's balance at a glance, and suggests the **minimum number of payments** needed to settle up.

The app is fully frontend your data lives in `localStorage` and runs offline once loaded. Authentication is _simulated_: register as many "simulated" users as you want on the same device, then switch perspective from the header to test invites, accepts, and settlements end-to-end.

## ✨ Highlights

- **Four split methods.** Equal, exact amounts, percentage (basis-point precision), and weighted shares — with live previews of each person's share as you type.
- **Simplify Debts optimizer.** A classic greedy min-cash-flow algorithm reduces a tangle of IOUs to the fewest payments needed to balance the books.
- **Multi-user from one screen.** A header switcher lets you act as any registered user. Send an invite as Alice, switch to Bob, accept it — all without leaving the tab.
- **Auditable balances.** Both the simplified payment plan _and_ the raw pairwise debt list are displayed.
- **Activity feed.** Chronological log of every expense, settlement, and member join per group.
- **Category breakdown.** A pie chart (on-theme!) per group showing spending by category.
- **Export / import.** One-click JSON snapshot for backups, demos, and recovery.
- **Modern, warm UI.** Tailwind + shadcn/ui with a custom pie-pastry palette and Fraunces serif headings; Framer Motion transitions throughout.

## 🧱 Stack

|                           |                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------- |
| Runtime / package manager | [Bun](https://bun.sh) 1.x                                                           |
| Bundler                   | [Vite](https://vitejs.dev) 6                                                        |
| Framework                 | React 18 + TypeScript                                                               |
| Routing                   | [TanStack Router](https://tanstack.com/router) (file-based, type-safe)              |
| State                     | [Zustand](https://zustand-demo.pmnd.rs/) with `persist` middleware → `localStorage` |
| Forms                     | React Hook Form + Zod                                                               |
| UI                        | TailwindCSS + [shadcn/ui](https://ui.shadcn.com) (Radix primitives)                 |
| Animation                 | [Framer Motion](https://www.framer.com/motion/)                                     |
| Charts                    | [Recharts](https://recharts.org/)                                                   |
| Icons                     | [lucide-react](https://lucide.dev)                                                  |

## 🚀 Getting started

```bash
bun install
bun run dev          # http://localhost:5173
bun run typecheck    # strict TS check
bun run build        # production build → dist/
bun run preview      # serve the production build locally
```

Bun 1.x is required (uses workspaces and the bundled lock format). Node 20+ also works with `pnpm`/`npm` after re-running install.

## 🧭 Project layout

```
src/
├── routes/                  # TanStack Router file-based routes (auto-generated routeTree.gen.ts)
├── components/
│   ├── ui/                  # shadcn/ui primitives
│   ├── layout/              # AppHeader, UserSwitcher
│   ├── landing/             # Marketing landing page
│   ├── auth/                # Register, login (simulated)
│   ├── dashboard/           # Post-login overview
│   ├── groups/              # Group CRUD + detail layout + tabs
│   ├── expenses/            # ExpenseFormPage + per-method split editors
│   ├── invites/             # Send/receive flows
│   ├── settings/            # Profile, currency, export/import, reset
│   ├── charts/              # Category pie
│   └── common/              # UserAvatar, EmptyState, PieLogo
├── lib/
│   ├── split.ts             # Pure splitters (4 methods, deterministic rounding)
│   ├── balances.ts          # Net + pairwise balance computation
│   ├── simplify-debts.ts    # Greedy min-cash-flow optimizer
│   ├── currency.ts          # Intl-based formatting / parsing
│   ├── export.ts            # JSON snapshot helpers
│   └── utils.ts             # cn(), color/initials helpers
├── store/index.ts           # Zustand store with persist middleware (single source of truth)
├── hooks/                   # useCurrentUser, useGroupContext, useGroupBalances
├── types/index.ts           # Shared domain types
└── styles/globals.css       # Tailwind + theme tokens
```

## 🎨 Design system

The palette is named for parts of a pie:

| Token       | HSL           | Use                                 |
| ----------- | ------------- | ----------------------------------- |
| `--crust`   | `22 70% 70%`  | Primary actions (warm peach)        |
| `--berry`   | `351 50% 53%` | Accent / emphasis (muted raspberry) |
| `--vanilla` | `38 65% 95%`  | Page background (cream)             |
| `--cocoa`   | `22 35% 18%`  | Body text (dark chocolate)          |
| `--filling` | `38 50% 88%`  | Card / muted surfaces (light cream) |

Headings use **Fraunces** (serif) for warmth; body uses **Inter** (sans). Cards have generous rounding (`0.85rem`) for a pastry feel; the body has a subtle radial gradient backdrop.

## 🧠 Tricky decisions & how Pie handles them

1. **Integer cents everywhere.** Floating-point would corrupt split math (`0.1 + 0.2 ≠ 0.3`). Every monetary value is stored as integer cents; the display layer formats via `Intl.NumberFormat`.

2. **Deterministic remainder cents.** Equal/percentage/shares splits often leave a leftover cent (e.g. `1000 / 3 = 333.33`). Pie distributes the remainder to user IDs sorted ascending — predictable, stable across re-renders, and total always sums to the input exactly.

3. **Pair-balance canonicalization.** Pair keys are sorted before storage so `(A, B)` and `(B, A)` collapse to one entry — never double-counted. The aggregate is signed; direction is normalized at render time.

4. **Simplify-debts vs. raw pairwise.** Both are shown. Raw is auditable (“why does Pie think Bob owes Alice $30?”); simplified is actionable (“actually, just pay Carol once”).

5. **Invitees see history but aren't retroactively split.** A user accepting an invite can read all prior expenses (transparent ledger) but is **not** added to past splits. Only future expenses can include them. Avoids surprise debts at join time.

6. **Member removal with outstanding balance.** Pie blocks removal until the user's balance is zero (within ±1¢ to absorb rounding). A dialog explains why and points to **Settle Up**.

7. **Multi-user perspective clarity.** When more than one account exists on the device, a tinted banner under the header reminds you _who you're acting as_. This is the single biggest UX risk of a shared-localStorage app.

8. **Schema versioning.** The persist middleware tags state with `version: 1` and exposes a `migrate` hook for future shape changes — existing demo data won't brick after an update.

9. **Tolerance on the optimizer.** `simplifyDebts` ignores balances within ±1¢ (sub-cent rounding artifacts that can't be paid). Otherwise the algorithm could loop emitting unpayable amounts.
