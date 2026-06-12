# %PROJECT_NAME%

React 18 + Vite + Authio SPA starter. Pure client-side — no BFF required.

## Run

```bash
pnpm install
cp .env.example .env.local
# replace VITE_AUTHIO_PROJECT_ID with a real proj_… from your dashboard
pnpm dev
```

Open http://localhost:5173/ — the app uses `<AuthioProvider>` from `@useauthio/react`, with `<SignedIn>` / `<SignedOut>` gates and a magic-link + passkey sign-in form.

## What this scaffold does

- `src/main.tsx` wraps the app in `<AuthioProvider apiUrl projectId />`. The provider parses the access JWT's `exp` claim and silently refreshes ~60s before expiry by POSTing `/v1/auth/refresh` with `credentials: include`.
- `src/App.tsx` demonstrates the full SDK surface:
  - `<SignedIn>` / `<SignedOut>` declarative gates,
  - `useAuthio()` for `{ user, status, signOut, accessToken }`,
  - `useAuthioRequired()` for protected views with a redirect-on-unauth fallback,
  - `signInWithMagicLink({ email, redirectUri })` for a passwordless email sign-in,
  - `signInWithPasskey({ email })` for WebAuthn sign-in.
- The SDK keeps the access token in memory by default. The HttpOnly refresh cookie is managed by auth-core directly.

## CORS

Auth-core enforces a per-project CORS allowlist. Make sure your SPA's origin is on the allowlist — see https://docs.authio.com/operations/setup-custom-domain.

## When to use this vs `@useauthio/nextjs`

| Use this (`@useauthio/react`) when... | Use `@useauthio/nextjs` when... |
|---|---|
| You have a pure SPA hitting auth-core via CORS | You have a Next.js BFF (RSC, middleware) |
| You can't run server-side cookies | You want HttpOnly cookies + RSC `auth()` helper |
| Bundle size matters more than zero-flash auth | First-paint auth state matters |

## Next steps

- Add more protected routes by wrapping them with `useAuthioRequired` or `<SignedIn>`.
- Deploy to Vercel / Cloudflare Pages / Netlify. Add env vars in your host.
- Read the docs: https://docs.authio.com/sdks/react
