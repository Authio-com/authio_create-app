<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { env as publicEnv } from "$env/dynamic/public";

  let email = $state("");
  let busy = $state(false);
  let message = $state<string | null>(null);

  const apiUrl = publicEnv.PUBLIC_AUTHIO_API_URL ?? "https://api.authio.com";
  const publishableKey = publicEnv.PUBLIC_AUTHIO_PUBLISHABLE_KEY ?? "";

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (!email) return;
    busy = true;
    message = null;
    const redirectUrl = $page.url.searchParams.get("redirect_url") ?? "/dashboard";
    const callback = `${$page.url.origin}/api/auth/callback?redirect=${encodeURIComponent(
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
        const err = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(err.message ?? `auth-core returned ${res.status}`);
      }
      message = "Check your email for the sign-in link.";
    } catch (err) {
      message = err instanceof Error ? err.message : "sign-in failed";
    } finally {
      busy = false;
    }
  }
</script>

<h1>Sign in</h1>
<p>Enter your email to receive a magic link.</p>

<form on:submit={submit} style="display: grid; gap: 12px; max-width: 360px;">
  <label>
    Email
    <input
      type="email"
      bind:value={email}
      required
      autocomplete="email"
      placeholder="you@example.com"
      style="width: 100%; padding: 8px 12px; border: 1px solid #d4d4d8; border-radius: 6px;"
    />
  </label>
  <button
    type="submit"
    disabled={busy}
    style="padding: 8px 16px; border-radius: 6px; background: #0a0a0a; color: white; border: none; cursor: pointer;"
  >
    {busy ? "Sending..." : "Send magic link"}
  </button>
</form>

{#if message}
  <p style="margin-top: 16px;">{message}</p>
{/if}
