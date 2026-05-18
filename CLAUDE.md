# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev        # Start Vite dev server
npm run build      # Type-check (vue-tsc) + production build
npm run preview    # Preview production build
```

No linting or test runner is configured yet. Type checking is done via `vue-tsc -b`.

Use `--legacy-peer-deps` when installing new npm packages (vite-plugin-pwa peer dep conflict with Vite 8).

## Architecture

**Feature-Sliced Design (FSD)** with layers: `app → pages → widgets → features → entities → shared`. Imports must only go downward (e.g., `pages` can import from `features` and `shared`, but not from `app`).

### Key layers

- **app/** — Vue app bootstrap: Pinia store creation, Vue Router setup, global styles (Tailwind entry point), root `App.vue` with `<router-view />`
- **pages/** — Route-level components. Each page is in `pages/<name>/ui/<Name>Page.vue` with a barrel `index.ts`
- **features/** — Business logic modules. Each feature has `api/` (Axios calls), `model/` (Pinia store), `ui/` (components), and a barrel `index.ts`
- **shared/** — Cross-cutting: `api/` (Axios instance with JWT interceptors), `config/` (env vars), `ui/` (reusable components like AppButton, AppInput), `types/`, `lib/`

### API & Auth

- Axios instance at `shared/api/instance.ts` with `withCredentials: true` (refresh token is HttpOnly cookie)
- Access token stored in `localStorage` under key `access_token`; request interceptor injects `Authorization: Bearer <token>`
- Response interceptor auto-refreshes on 401 via `GET /users/refresh-token`, redirects to `/login` on failure
- `main.ts` calls `authStore.initAuth()` on startup to restore session from localStorage
- Backend API schema is at `../trainify-backend/api/schema.yaml` (OpenAPI 3.0)
- API base URL configured via `VITE_API_BASE_URL` env var (default: `http://localhost:8000/api`)

### Routing & Guards

- Three route groups in `app/providers/router.ts`, gated by `meta` flags:
  - `meta: { guest: true }` — `/login`, `/register`, `/forgot-password`, `/reset-password`. Redirects to `/` if already authenticated.
  - `meta: { requiresAuth: true }` — wrapped in `widgets/layouts/MainLayout.vue` (sidebar + bottom-nav). Redirects to `/login` if no token.
  - `meta: { requiresAuth: true, requiresAdmin: true }` — `/admin/*`. Role checked by decoding JWT payload (`role === 'admin'`).
- Guard logic lives in a single `router.beforeEach` — token presence, not store state, is the source of truth.

### Styling

- Tailwind CSS v4 via `@tailwindcss/vite` plugin
- Dark theme with design tokens from Pencil designs: bg `#0F1117`, cards `#1A1D27`, inputs `#252836`, borders `#2D3748`, accent green `#22C55E`, text `#F1F5F9`/`#94A3B8`
- Font: Inter

### PWA

- `vite-plugin-pwa` with `registerType: 'autoUpdate'`
- Workbox precaches static assets; runtime caches API calls (NetworkFirst, 24h TTL)

## Conventions

- Vue 3 Composition API with `<script setup lang="ts">` exclusively
- Path alias: `@/` → `src/`
- Each module uses barrel exports (`index.ts`)
- Router uses lazy-loaded components: `() => import('@/pages/.../Page.vue')`
- Pinia stores use Composition API style (`defineStore` with setup function)
- Icons: `lucide-vue-next`

## In-repo planning docs

- `PLAN.md` — phased roadmap for implementing all ~25 screens against the OpenAPI schema. Useful as context when adding a new page/feature.
- `WORKOUT_GAPS.md` — known fronted/backend contract gaps around workout sessions (missing fields like `notes`, `duration`, `exercise_name`, `created_at`). Consult before touching workout flows.

## Design source — Pencil (`mcp__pencil__*`)

The canonical design is a `.pen` file (encrypted JSON) at `/Users/vbdantsaranov/study/vkr-code/trainify` (no extension). **Never use Read/Grep on this file** — access it only through Pencil MCP tools. Always sync with the design before reworking UI; "looks right" is not enough.

**Workflow for any UI task:**
1. `mcp__pencil__get_editor_state({ include_schema: true })` — once per conversation, to load the schema and see top-level frames.
2. `mcp__pencil__batch_get({ patterns: [{ name: "Screen/<Name>/<Mobile|Desktop>" }], readDepth: 2-3 })` — find the relevant screen frame by name pattern.
3. Drill into specific node IDs with `batch_get({ nodeIds: [...], readDepth: 3 })` for sub-sections (header, input block, modal, etc.).
4. `mcp__pencil__get_variables()` to read design tokens — these match Tailwind's theme: `accent-primary` (#22C55E), `bg-primary`, `bg-card`, `bg-input`, `border`, `text-primary`, `text-secondary`, `success`, `warning`, `error`, `info`, `white`.
5. `mcp__pencil__get_screenshot({ nodeId })` only when you need to verify visual fidelity (colors, alignment) — screenshots are expensive, prefer `snapshot_layout` for sizing/structure checks.

**Screen naming convention in the file:** `Screen/<Feature>/<Mobile|Desktop>` (e.g., `Screen/Workouts/Mobile`, `Screen/ActiveWorkout/Mobile`). Active-workout states are separate sibling frames: `Workout/ActivePlan`, `Workout/ActiveFree`, `Workout/ActivePlan/AllSetsComplete`, `Workout/Finish`.

**Reusable components are referenced via `ref` nodes.** Common IDs:
- Buttons: `a0xE7` Primary/L, `Trwia` Primary/M, `Qzk8o` Primary/S, `RryMq` Secondary/M, `96lE3` Ghost/M, `U8I92` Danger/M, `LgiJp` Danger/L
- Form: `QXnja` Input, `UVxfh` Select
- Surfaces: `Auvml` Card, `Hje8T` Badge, `51fr9` Modal, `chVLk` ConfirmDialog, `esMxS` EmptyState
- Toasts: `ZsqDu` Success, `00xn1` Error, `waWmB` Info
- Nav: `oJDgc` NavItem, `Ov7yH` NavItem/Active, `lchVF` Sidebar, `X3j8M` BottomNav

These map roughly 1:1 to `shared/ui/App*.vue` components — when a design uses a ref, prefer the matching shared component over hand-rolled markup.

## Backend endpoints (operationId quick reference)

Full schema at `../trainify-backend/api/schema.yaml`. Group by domain:

- **Auth/Users:** `loginUser`, `registerUser`, `refreshToken`, `forgotPassword`, `resetPassword`, `getMe`, `updateMe`, `changePassword`
- **Exercises:** `listExercises`, `createExercise`
- **Workouts:** `createWorkout`, `listWorkouts`, `getWorkout`, `deleteWorkout`, `addSets` (`POST /workouts/{id}/sets`), `completeWorkout` (`POST /workouts/{id}/complete`)
- **Plans:** `listPlans`, `getPlan`, `createPlan`, `updatePlan`, `deletePlan`
- **Analytics:** `getProgress`, `getRecords`, `getDashboard`
- **AI Insights:** `createInsightsJob`, `listInsightsJobs`, `getLatestInsight`, plus per-id getter
- **Admin:** `adminListUsers`, `adminGetStats`, `adminListPendingExercises`, `adminApproveExercise`, `adminRejectExercise`

When wiring a new feature, read the schema's request/response shapes first — types in `shared/types/index.ts` mirror them but can drift (see `WORKOUT_GAPS.md`).
