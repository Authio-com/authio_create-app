<script lang="ts">
  import { authio } from "$lib/stores/user";
</script>

<h1>Welcome to %PROJECT_NAME%</h1>
<p>This SvelteKit starter is wired to Authio.</p>

{#if $authio.session}
  <p>
    Signed in as <code>{$authio.session.userId}</code>.
    <a href="/dashboard">Open dashboard</a> ·
    <form method="POST" action="/api/auth/sign-out" style="display: inline;">
      <button type="submit">Sign out</button>
    </form>
  </p>
{:else}
  <ul>
    <li><a href="/sign-in">Sign in</a></li>
    <li><a href="/dashboard">Dashboard</a> (protected)</li>
    <li><a href="/api/me">/api/me</a> (route handler reading auth)</li>
  </ul>
{/if}

<p style="color: #6b7280; font-size: 14px; margin-top: 2rem;">
  Edit <code>src/routes/+page.svelte</code> to make this your own. The server
  hook verifies the Authio session JWT against the cached JWKS once per
  request.
</p>
