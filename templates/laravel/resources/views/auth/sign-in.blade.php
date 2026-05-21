<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sign in · %PROJECT_NAME%</title>
    <style>
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin: 0; padding: 2rem; background: #fafafa; color: #0a0a0a;
        }
        main { max-width: 420px; margin: 0 auto; }
        form { display: grid; gap: 12px; max-width: 360px; }
        input {
            padding: 8px 12px; border: 1px solid #d4d4d8; border-radius: 6px;
        }
        button {
            padding: 8px 16px; border-radius: 6px; background: #0a0a0a;
            color: white; border: none; cursor: pointer;
        }
    </style>
</head>
<body>
<main>
    <h1>Sign in</h1>
    <p>Enter your email to receive a magic link.</p>
    <form id="signin-form">
        <label for="email">Email</label>
        <input
            id="email"
            type="email"
            name="email"
            required
            autocomplete="email"
            placeholder="you@example.com"
        >
        <button type="submit" id="submit-btn">Send magic link</button>
    </form>
    <p id="status" style="margin-top: 16px;"></p>
    <script>
        const API_URL = @json($api_url);
        const PUB_KEY = @json($publishable_key);
        const REDIRECT = @json($redirect_url);
        const origin = window.location.origin;

        document.getElementById('signin-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value.trim();
            const btn = document.getElementById('submit-btn');
            const status = document.getElementById('status');
            if (!email) return;
            btn.disabled = true;
            btn.textContent = 'Sending...';
            status.textContent = '';
            const callback = `${origin}/auth/callback?redirect=${encodeURIComponent(REDIRECT)}`;
            try {
                const res = await fetch(`${API_URL}/v1/auth/magic-link/start`, {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                        'x-publishable-key': PUB_KEY,
                    },
                    body: JSON.stringify({ email, redirect_url: callback }),
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.message || `auth-core returned ${res.status}`);
                }
                status.textContent = 'Check your email for the sign-in link.';
            } catch (err) {
                status.textContent = err.message || 'sign-in failed';
            } finally {
                btn.disabled = false;
                btn.textContent = 'Send magic link';
            }
        });
    </script>
</main>
</body>
</html>
