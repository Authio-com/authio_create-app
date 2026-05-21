<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Dashboard · %PROJECT_NAME%</title>
    <style>
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin: 0; padding: 2rem; background: #fafafa; color: #0a0a0a;
        }
        main { max-width: 600px; margin: 0 auto; }
        code { background: #eee; padding: 2px 6px; border-radius: 4px; }
        button {
            padding: 8px 16px; border-radius: 6px; background: #0a0a0a;
            color: white; border: none; cursor: pointer;
        }
    </style>
</head>
<body>
<main>
    <h1>Dashboard</h1>
    <p>Signed in as <code>{{ $session->userId }}</code></p>
    <p>
        Active organization:
        <code>{{ $session->orgId ?? '(none selected — multi-org user)' }}</code>
    </p>
    @if ($session->role)
        <p>Role: <code>{{ $session->role }}</code></p>
    @endif
    <form method="POST" action="/auth/sign-out" style="margin-top: 24px;">
        @csrf
        <button type="submit">Sign out</button>
    </form>
    <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
        Protected by <code>AuthenticateWithAuthio</code> middleware. The session
        JWT is verified against the cached JWKS via <code>authio/authio</code>.
    </p>
</main>
</body>
</html>
