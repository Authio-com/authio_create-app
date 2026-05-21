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
- http://localhost:3000/sign-in — drop-in `<SignIn />` from `@authio/react`
- http://localhost:3000/dashboard — protected; reads the session via `auth()`
- http://localhost:3000/api/me — Route Handler returning the verified session JSON

## What this scaffold does

- `middleware.ts`: `authMiddleware` from `@authio/nextjs` verifies the `authio_session` cookie's JWT against the cached JWKS at the Edge runtime. No round-trip to auth-core on the hot path.
- `app/layout.tsx`: wraps the tree in `AuthioProvider`, which gives every component access to `useUser`, `useOrganizations`, `useActiveOrganization`, `useSwitchOrganization`.
- `app/sign-in/page.tsx`: renders `<SignIn />` — passkey + magic link + OAuth, all in one component.
- `app/dashboard/page.tsx`: Server Component, calls `auth()` server-side. `userId` is always set; `orgId` may be null when the user belongs to multiple organizations and hasn't yet selected one.
- `app/api/me/route.ts`: same pattern, but returns JSON.

## Next steps

- Add an `<OrganizationSwitcher />` (from `@authio/react`) in your top nav.
- Deploy to Vercel / Railway / your favorite host. Set the env vars there.
- Read the docs: https://docs.authio.com
