<script setup lang="ts">
import { SignedIn, SignedOut } from "@authio.com/vue";
import { RouterLink } from "vue-router";
import SignInForm from "../components/SignInForm.vue";
</script>

<template>
  <main>
    <SignedOut>
      <p>You are signed out. Try signing in below.</p>
      <SignInForm />
    </SignedOut>
    <SignedIn>
      <p>
        You are signed in. Visit the <RouterLink to="/dashboard">dashboard</RouterLink>.
      </p>
    </SignedIn>
  </main>
</template>
