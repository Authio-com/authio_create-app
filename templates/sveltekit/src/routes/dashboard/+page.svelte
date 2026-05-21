<script lang="ts">
  import type { PageData } from "./$types";
  let { data }: { data: PageData } = $props();
</script>

<h1>Dashboard</h1>
<p>
  Signed in as <code>{data.session.userId}</code>
</p>
<p>
  Active organization:
  <code>{data.session.orgId ?? "(none selected — multi-org user)"}</code>
</p>
{#if data.session.role}
  <p>Role: <code>{data.session.role}</code></p>
{/if}

<form method="POST" action="/api/auth/sign-out" style="margin-top: 24px;">
  <button
    type="submit"
    style="padding: 8px 16px; border-radius: 6px; background: #0a0a0a; color: white; border: none; cursor: pointer;"
    >Sign out</button
  >
</form>

<p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
  This page is protected by <code>hooks.server.ts</code>. The session JWT is
  verified against the cached JWKS at the edge.
</p>
