# %PROJECT_NAME%

Vue 3 + Vite + Authio SPA starter. Pure client-side — no BFF required.

## Run

```bash
pnpm install
cp .env.example .env.local
# replace VITE_AUTHIO_PROJECT_ID with a real proj_… from your dashboard
pnpm dev
```

Open http://localhost:5173/ — the app installs the Authio plugin globally, registers a `vue-router` `beforeEach` guard, and demonstrates `<SignedIn>` / `<SignedOut>` gates plus a magic-link + passkey sign-in form.

## What this scaffold does

- `src/main.ts` calls `app.use(createAuthio({ apiUrl, projectId }))` to install the Authio plugin, then wires `createAuthioRouterGuard({ signInPath: "/sign-in" })` into `router.beforeEach`. Routes with `meta: { requiresAuth: true }` redirect unauthenticated users with `?returnTo=...`.
- `src/App.vue` uses `useAuthio()` for `{ user, status, signOut }` and shows a "signed in as ..." bar via `<SignedIn>`.
- `src/components/SignInForm.vue` demonstrates `signInWithMagicLink({ email, redirectUri })` and `signInWithPasskey({ email })`.
- `src/views/Dashboard.vue` is a protected route — the router guard redirects you away if you visit it while unauthenticated.

## CORS

Auth-core enforces a per-project CORS allowlist. Make sure your SPA's origin is on the allowlist — see https://docs.authio.com/operations/setup-custom-domain.

## When to use this vs `@authio/nextjs`

| Use this (`@authio/vue`) when... | Use `@authio/nextjs` when... |
|---|---|
| You have a pure Vite + Vue 3 SPA | Your stack is Next.js (React + RSC) |
| You're on Nuxt 3 (use the experimental `@authio/vue/nuxt` module) | You want HttpOnly cookies + RSC `auth()` helper |

## Next steps

- Add more protected routes by setting `meta: { requiresAuth: true }`.
- Deploy to Vercel / Cloudflare Pages / Netlify.
- Read the docs: https://docs.authio.com/sdks/vue
