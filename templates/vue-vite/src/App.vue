<script setup lang="ts">
import { SignedIn, useAuthio } from "@authio/vue";
import { RouterLink, RouterView } from "vue-router";

const { user, signOut } = useAuthio();
</script>

<template>
  <div class="container">
    <header>
      <h1>%PROJECT_NAME%</h1>
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/dashboard">Dashboard</RouterLink>
      </nav>
    </header>

    <SignedIn>
      <div class="signed-in-bar">
        <span>Signed in as {{ user?.email }}</span>
        <button type="button" @click="signOut">Sign out</button>
      </div>
    </SignedIn>

    <RouterView />
  </div>
</template>

<style scoped>
.container {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
nav {
  display: flex;
  gap: 1rem;
}
.signed-in-bar {
  background: #f4f4f5;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
