<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>%PROJECT_NAME%</title>
    <style>
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin: 0;
            padding: 2rem;
            background: #fafafa;
            color: #0a0a0a;
        }
        main { max-width: 720px; margin: 0 auto; }
        code { background: #eee; padding: 2px 6px; border-radius: 4px; }
    </style>
</head>
<body>
<main>
    <h1>Welcome to %PROJECT_NAME%</h1>
    <p>This Laravel starter is wired to Authio.</p>
    @if ($session)
        <p>
            Signed in as <code>{{ $session->userId }}</code> ·
            <a href="/dashboard">Dashboard</a> ·
            <form method="POST" action="/auth/sign-out" style="display: inline;">
                @csrf
                <button type="submit">Sign out</button>
            </form>
        </p>
    @else
        <ul>
            <li><a href="/auth/sign-in">Sign in</a></li>
            <li><a href="/dashboard">Dashboard</a> (protected)</li>
        </ul>
    @endif
    <p style="color: #6b7280; font-size: 14px; margin-top: 2rem;">
        Edit <code>resources/views/welcome.blade.php</code> to make this your own.
        The middleware <code>App\\Http\\Middleware\\AuthenticateWithAuthio</code>
        verifies the session JWT against the cached JWKS via the
        <code>authio/authio</code> Composer package.
    </p>
</main>
</body>
</html>
