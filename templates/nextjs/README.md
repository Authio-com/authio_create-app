# %PROJECT_NAME%

Next.js 15 + Authio starter. Edge middleware verifies sessions; `auth()` helper reads them in Server Components and Route Handlers.

## Run

```bash
pnpm install
cp .env.example .env.local
# replace AUTHIO_SECRET_KEY with a real sk_test_ from your dashboard
pnpm dev
```

Then open:

- http://localhost:3000/ — public landing
- http://localhost:3000/sign-in — starts the cookie-bound Authio sign-in flow
- http://localhost:3000/dashboard — protected; reads the session via `auth()`
- http://localhost:3000/api/me — Route Handler returning the verified session JSON

## What this scaffold does

- `middleware.ts`: `createAuthioMiddleware()` from `@useauthio/nextjs` gates your auth-protected routes AND handles silent refresh — when the 15-minute access JWT ages out, the middleware quietly routes the user through `/api/auth/refresh` and back, so they stay signed in for the full org-policy refresh window (default 30 days) without ever seeing the sign-in page.
- `app/api/auth/sign-in/route.ts` creates an HttpOnly callback-state cookie before leaving your origin. `callback/route.ts` requires the echoed state to match and verifies the access JWT before writing session cookies. `refresh/route.ts` and `sign-out/route.ts` complete the BFF lifecycle.
- `app/layout.tsx`: wraps the tree in `AuthioProvider`, which gives every component access to `useUser`, `useOrganizations`, `useActiveOrganization`, `useSwitchOrganization`.
- `app/sign-in/page.tsx`: links to the strict server-side sign-in-start route.
- `app/dashboard/page.tsx`: Server Component, calls `auth()` server-side. `userId` is always set; `orgId` may be null when the user belongs to multiple organizations and hasn't yet selected one.
- `app/api/me/route.ts`: same pattern, but returns JSON.

## Next steps

- Add an `<OrganizationSwitcher />` (from `@useauthio/react`) in your top nav.
- Deploy to Vercel / Railway / your favorite host. Set the env vars there.
- Read the docs: https://docs.authio.com
