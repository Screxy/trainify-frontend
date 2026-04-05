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
- Request interceptor injects `Authorization: Bearer <token>` from localStorage
- Response interceptor auto-refreshes on 401 via `GET /users/refresh-token`, redirects to `/login` on failure
- Backend API schema is at `../trainify-backend/api/schema.yaml` (OpenAPI 3.0)
- API base URL configured via `VITE_API_BASE_URL` env var (default: `http://localhost:8000/api`)

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
