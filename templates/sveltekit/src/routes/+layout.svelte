<script lang="ts">
  import { onMount } from "svelte";
  import { setSession } from "$lib/stores/user";
  import type { LayoutData } from "./$types";

  let { data, children }: { data: LayoutData; children: import("svelte").Snippet } = $props();

  onMount(() => {
    setSession(data.session);
  });

  $effect(() => {
    setSession(data.session);
  });
</script>

<main style="max-width: 720px; margin: 0 auto;">
  {@render children?.()}
</main>
