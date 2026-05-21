import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  return {
    publishableKey: process.env.AUTHIO_PUBLISHABLE_KEY ?? "",
    apiUrl: process.env.AUTHIO_API_URL ?? "https://api.authio.com",
    origin: url.origin,
  };
}

export default function SignIn() {
  const { publishableKey, apiUrl, origin } = useLoaderData<typeof loader>();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;
    setBusy(true);
    setMessage(null);
    const redirectUrl = params.get("redirect_url") ?? "/dashboard";
    const callback = `${origin}/auth/callback?redirect=${encodeURIComponent(
      redirectUrl,
    )}`;
    try {
      const res = await fetch(`${apiUrl}/v1/auth/magic-link/start`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-publishable-key": publishableKey,
        },
        body: JSON.stringify({ email, redirect_url: callback }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(err.message ?? `auth-core returned ${res.status}`);
      }
      setMessage("Check your email for the sign-in link.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "0 auto" }}>
      <h1>Sign in</h1>
      <p>Enter your email to receive a magic link.</p>
      <form
        onSubmit={submit}
        style={{ display: "grid", gap: 12, maxWidth: 360 }}
      >
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #d4d4d8",
              borderRadius: 6,
            }}
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            background: "#0a0a0a",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          {busy ? "Sending..." : "Send magic link"}
        </button>
      </form>
      {message && <p style={{ marginTop: 16 }}>{message}</p>}
    </main>
  );
}
