# %PROJECT_NAME%

Laravel 11 + Authio starter. The `authio/authio` Composer package verifies the
session JWT against Authio's JWKS, and the `AuthenticateWithAuthio` middleware
gates protected routes.

## Run

```bash
composer install
cp .env.example .env
php artisan key:generate
# Replace AUTHIO_SECRET_KEY with a real sk_test_ key from your dashboard.
php artisan serve
```

Then open:

- http://localhost:8000/ — public landing
- http://localhost:8000/auth/sign-in — magic-link sign-in
- http://localhost:8000/dashboard — protected; middleware verifies the cookie
- http://localhost:8000/auth/callback — Authio redirects here with `?access_token`

## What this scaffold does

- `app/Providers/AppServiceProvider.php` — binds `Authio\Authio` as a singleton
  from `AUTHIO_*` env vars.
- `app/Http/Middleware/AuthenticateWithAuthio.php` — reads the `authio_session`
  HTTP-only cookie, calls `$authio->verifyToken($token)`, and either attaches
  the verified `Session` to the request or redirects to `/auth/sign-in`.
- `routes/web.php` — wires the public home, sign-in, callback, sign-out, and
  protected `/dashboard`.
- `resources/views/auth/sign-in.blade.php` — calls
  `https://auth.authio.com/v1/auth/magic-link/start` with the publishable key.
- `resources/views/dashboard.blade.php` — renders the verified session.

## Env vars

| Variable                 | Required | Notes                                       |
| ------------------------ | -------- | ------------------------------------------- |
| `AUTHIO_PUBLISHABLE_KEY` | yes      | Browser-safe `pk_` key.                     |
| `AUTHIO_API_URL`         | optional | Auth-core base URL. Defaults to production. |
| `AUTHIO_SECRET_KEY`      | optional | Only needed for management API calls.       |
| `APP_KEY`                | yes      | Laravel app key (`php artisan key:generate`). |

## Requirements

- PHP 8.2+
- Composer 2.x

## Docs

https://authiodocs-production.up.railway.app
