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
| **Express** | Bearer-token-verifying middleware on `/me` and `/me/memberships` |
| **Hono** | Same as Express but with Hono ergonomics |
| **Skip** | Just installs the SDKs; you bring the framework |

## Flags (skip prompts)

```bash
npx create-authio-app my-app --framework nextjs --publishable-key pk_live_... --yes
```

## Docs

https://authiodocs-production.up.railway.app

## License

MIT
