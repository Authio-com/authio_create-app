<script setup lang="ts">
import { useAuthio } from "@useauthio/vue";

const { user } = useAuthio();
</script>

<template>
  <main>
    <h2>Dashboard</h2>
    <p v-if="user">Signed in as {{ user.email }}.</p>
    <pre>{{ JSON.stringify(user, null, 2) }}</pre>
  </main>
</template>

<style scoped>
pre {
  background: #f4f4f5;
  padding: 1rem;
  border-radius: 6px;
  overflow: auto;
}
</style>
