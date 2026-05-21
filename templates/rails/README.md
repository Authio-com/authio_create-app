# %PROJECT_NAME%

Rails 7.1 + Authio starter. Controllers use the `authio` gem to verify session
JWTs against Authio's JWKS, and `authenticate_authio!` gates protected actions.

## Run

```bash
bundle install
cp .env.example .env
# Replace AUTHIO_SECRET_KEY with a real sk_test_ key from your dashboard.
# Generate a SECRET_KEY_BASE: bundle exec rails secret
bin/rails server
```

Then open:

- http://localhost:3000/ — public landing
- http://localhost:3000/auth/sign-in — magic-link sign-in
- http://localhost:3000/dashboard — protected; `authenticate_authio!` enforces auth
- http://localhost:3000/api/me — JSON returning the verified session

## What this scaffold does

- `config/initializers/authio.rb` — configures the `Authio::Client` singleton
  from env vars (`AUTHIO_SECRET_KEY`, `AUTHIO_API_URL`, `AUTHIO_PUBLISHABLE_KEY`).
- `app/controllers/concerns/authio_authentication.rb` — exposes
  `authenticate_authio!` (before-action) and `authio_session` (helper) that
  read the `authio_session` HTTP-only cookie and verify it via the gem.
- `app/controllers/sessions_controller.rb` — renders the sign-in form,
  consumes `?access_token=…` from auth-core, and stamps the cookie.
- `app/controllers/dashboard_controller.rb` — protected with
  `before_action :authenticate_authio!`.
- `config/routes.rb` — wires the routes.

## Env vars

| Variable                 | Required | Notes                                       |
| ------------------------ | -------- | ------------------------------------------- |
| `AUTHIO_PUBLISHABLE_KEY` | yes      | Browser-safe `pk_` key.                     |
| `AUTHIO_API_URL`         | optional | Auth-core base URL. Defaults to production. |
| `AUTHIO_SECRET_KEY`      | optional | Only needed for management API calls.       |
| `SECRET_KEY_BASE`        | yes      | Rails secret. Generate with `rails secret`. |

## Requirements

- Ruby 3.2+
- Bundler 2.x

## Docs

https://docs.authio.com
