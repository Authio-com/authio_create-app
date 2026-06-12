<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { signInWithMagicLink, signInWithPasskey } from "@useauthio/vue";

const apiUrl =
  import.meta.env.VITE_AUTHIO_API_URL ?? "https://auth-api.authio.com";
const projectId =
  import.meta.env.VITE_AUTHIO_PROJECT_ID ?? "proj_REPLACE_ME";

const email = ref("");
const status = ref<"idle" | "sending" | "sent" | "error">("idle");
const error = ref<string | null>(null);
const router = useRouter();

async function handleMagicLink(e: Event) {
  e.preventDefault();
  status.value = "sending";
  error.value = null;
  try {
    await signInWithMagicLink({
      apiUrl,
      projectId,
      email: email.value,
      redirectUri: window.location.origin + "/dashboard",
    });
    status.value = "sent";
  } catch (err) {
    status.value = "error";
    error.value = err instanceof Error ? err.message : "unknown error";
  }
}

async function handlePasskey() {
  status.value = "sending";
  error.value = null;
  try {
    await signInWithPasskey({ apiUrl, projectId, email: email.value });
    void router.push("/dashboard");
  } catch (err) {
    status.value = "error";
    error.value = err instanceof Error ? err.message : "unknown error";
  }
}
</script>

<template>
  <form @submit="handleMagicLink">
    <label>
      Email
      <input
        v-model="email"
        type="email"
        required
        style="display: block; width: 100%; padding: 0.5rem; margin-top: 0.25rem"
      />
    </label>
    <div style="display: flex; gap: 0.5rem; margin-top: 1rem">
      <button type="submit" :disabled="status === 'sending'">
        {{
          status === "sending"
            ? "Sending..."
            : status === "sent"
              ? "Sent — check your email"
              : "Send magic link"
        }}
      </button>
      <button type="button" :disabled="!email" @click="handlePasskey">
        Sign in with passkey
      </button>
    </div>
    <p v-if="error" style="color: crimson">{{ error }}</p>
  </form>
</template>
