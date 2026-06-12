import type { Handle } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import { verifySessionCookie } from "@useauthio/svelte/server";
import { env as publicEnv } from "$env/dynamic/public";

const PROTECTED_PREFIXES = ["/dashboard", "/api/me"];

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get("authio_session");
  event.locals.session = token
    ? await verifySessionCookie(token, {
        apiUrl: publicEnv.PUBLIC_AUTHIO_API_URL,
      })
    : null;

  if (isProtected(event.url.pathname) && !event.locals.session) {
    throw redirect(
      303,
      `/sign-in?redirect_url=${encodeURIComponent(event.url.pathname)}`,
    );
  }

  return resolve(event);
};

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}
