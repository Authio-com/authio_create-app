# %PROJECT_NAME%

Express + Authio starter. Bearer-token verification on `/me` and `/me/memberships`.

## Run

```bash
pnpm install
cp .env.example .env
# replace AUTHIO_SECRET_KEY with a real sk_test_ key from your dashboard
pnpm dev
```

Then exercise:

```bash
curl http://localhost:4000/                   # health check
curl http://localhost:4000/me \\
  -H 'Authorization: Bearer <Authio access JWT>'
```

## Docs

https://docs.authio.com
