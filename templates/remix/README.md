# %PROJECT_NAME%

Remix + Authio starter. Loaders gate auth (`requireSession`); session JWT is
stored in a Remix `createCookieSessionStorage` HTTP-only cookie and verified
against the Authio JWKS via `@authio.com/node`.

## Run

```bash
pnpm install
cp .env.example .env
# Replace AUTHIO_SECRET_KEY with a real sk_test_ key from your dashboard.
# Set SESSION_SECRET to 32+ bytes of random data for production.
pnpm dev
```

Then open:

- http://localhost:3000/ — public landing
- http://localhost:3000/sign-in — magic-link sign-in
- http://localhost:3000/dashboard — protected; loader throws redirect if no session
- http://localhost:3000/api/me — JSON loader returning the verified session

## What this scaffold does

- `app/lib/auth.server.ts` — wraps Remix's cookie session storage. Stores the
  raw Authio access token under `token`, verifies it via `@authio.com/node`'s
  `JwtVerifier`, and exposes `getSession()` / `requireSession()` helpers.
- `app/routes/sign-in.tsx` — calls `auth.authio.com`'s
  `/v1/auth/magic-link/start` from the browser using the publishable key.
- `app/routes/auth.callback.tsx` — receives the `?access_token=…` from
  auth-core, verifies it, and commits the session cookie before redirecting.
- `app/routes/dashboard.tsx` — `requireSession` gates the page in the loader.
- `app/routes/sign-out.tsx` — action wipes the cookie and redirects home.

## Env vars

| Variable                 | Required | Notes                                       |
| ------------------------ | -------- | ------------------------------------------- |
| `AUTHIO_PUBLISHABLE_KEY` | yes      | Loaded into the sign-in route.              |
| `AUTHIO_API_URL`         | optional | Auth-core base URL. Defaults to production. |
| `SESSION_SECRET`         | yes      | Used to sign the session cookie.            |
| `AUTHIO_SECRET_KEY`      | optional | Only needed for management API calls.       |

## Docs

https://docs.authio.com
