# create-authio-app

Scaffold a working app pre-wired to Authio (passkey, magic link, multi-org).

```bash
npx create-authio-app my-authio-app
# or
pnpm create authio-app my-authio-app
```

You'll be asked for a project name, framework, and Authio publishable key. The scaffold is a complete, runnable starter — `pnpm install && pnpm dev` and you're authenticating users.

## Frameworks

| Choice | What you get |
|---|---|
| **Next.js 15 (App Router)** | `middleware.ts` for edge JWT verification, `<SignIn />` page, protected `/dashboard` Server Component, `/api/me` Route Handler |
| **SvelteKit** | `hooks.server.ts` JWT verification, magic-link sign-in, protected `/dashboard`, `/api/me`, Svelte store for session |
| **Remix** | Cookie session storage via `createCookieSessionStorage`, `requireSession()` loader guard, callback route, JSON API |
| **Express** | Bearer-token-verifying middleware on `/me` and `/me/memberships` |
| **Hono** | Same as Express but with Hono ergonomics |
| **Laravel 11** | `AuthenticateWithAuthio` middleware, `authio/authio` Composer SDK, Blade sign-in + dashboard views |
| **Rails 7.1** | `authenticate_authio!` before-action, `authio` Ruby gem, ERB sign-in + dashboard views |
| **Skip** | Just installs the SDKs; you bring the framework |

## Flags (skip prompts)

```bash
npx create-authio-app my-app --framework nextjs --publishable-key pk_live_... --yes
# Also accepts --framework=name and --skip-prechecks (bypass Node/PHP/Ruby checks)
```

## Docs

https://authiodocs-production.up.railway.app

## License

MIT
