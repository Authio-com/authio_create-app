import { createApp } from "vue";
import { createAuthio, createAuthioRouterGuard } from "@useauthio/vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import Home from "./views/Home.vue";
import SignInView from "./views/SignIn.vue";
import Dashboard from "./views/Dashboard.vue";

const apiUrl =
  import.meta.env.VITE_AUTHIO_API_URL ?? "https://auth-api.authio.com";
const projectId = import.meta.env.VITE_AUTHIO_PROJECT_ID ?? "proj_REPLACE_ME";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: Home },
    { path: "/sign-in", component: SignInView },
    {
      path: "/dashboard",
      component: Dashboard,
      meta: { requiresAuth: true },
    },
  ],
});

const app = createApp(App);
app.use(createAuthio({ apiUrl, projectId }));
router.beforeEach(createAuthioRouterGuard({ signInPath: "/sign-in" }));
app.use(router);
app.mount("#app");
