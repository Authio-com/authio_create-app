# %PROJECT_NAME%

SvelteKit + Authio starter. `hooks.server.ts` verifies the session JWT once per
request and exposes it on `event.locals.session`; `+page.server.ts` files can
gate routes and the `$lib/stores/user` writable carries the session into the
client tree.

## Run

```bash
pnpm install
cp .env.example .env
# Replace AUTHIO_SECRET_KEY with a real sk_test_ key from your dashboard.
pnpm dev
```

Then open:

- http://localhost:5173/ — public landing
- http://localhost:5173/sign-in — magic-link sign-in
- http://localhost:5173/dashboard — protected; reads `locals.session`
- http://localhost:5173/api/me — JSON endpoint returning the verified session

## What this scaffold does

- `src/hooks.server.ts` — reads the `authio_session` cookie, verifies it with
  `@useauthio/svelte/server` (a thin wrapper over `@useauthio/node` JWKS verification),
  and assigns `event.locals.session`. Redirects to `/sign-in` for protected
  paths when the session is missing.
- `src/routes/sign-in/+page.svelte` — calls `auth.authio.com`'s
  `/v1/auth/magic-link/start` directly from the browser using the publishable
  key. The callback URL routes to `/api/auth/callback`.
- `src/routes/api/auth/callback/+server.ts` — consumes the `?access_token=…`
  from auth-core, verifies it, and stamps an HTTP-only `authio_session` cookie.
- `src/routes/dashboard/+page.server.ts` — guards the page server-side.
- `src/lib/stores/user.ts` — writable Svelte store keyed off the session data
  loaded in `+layout.server.ts`. Use this in any `.svelte` file.

## Env vars

| Variable                          | Required | Notes                                          |
| --------------------------------- | -------- | ---------------------------------------------- |
| `PUBLIC_AUTHIO_PUBLISHABLE_KEY`   | yes      | Browser-safe key. Starts with `pk_`.           |
| `PUBLIC_AUTHIO_API_URL`           | optional | Auth-core base URL. Defaults to production.    |
| `AUTHIO_SECRET_KEY`               | optional | Only required if you call the management API. |

## Docs

https://docs.authio.com
