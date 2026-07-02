import { redirect, type RequestHandler } from "@sveltejs/kit";
import { verifySessionCookie } from "@useauthio/svelte/server";
import { env as publicEnv } from "$env/dynamic/public";

const COOKIE_NAME = "authio_session";
const COOKIE_MAX_AGE = 60 * 60 * 8;
// One-shot sign-in error flash. Query-string error codes leak into
// browser history / logs / Referer; read (and clear) this cookie on
// your sign-in page instead.
const FLASH_COOKIE = "authio_signin_flash";

export const GET: RequestHandler = async ({ url, cookies }) => {
  const token = url.searchParams.get("access_token");
  const redirectTo = url.searchParams.get("redirect") ?? "/dashboard";

  function signInError(code: string): never {
    cookies.set(FLASH_COOKIE, code, {
      path: "/",
      maxAge: 60,
      sameSite: "lax",
      secure: url.protocol === "https:",
      httpOnly: false,
    });
    throw redirect(303, "/sign-in");
  }

  if (!token) {
    signInError("missing_token");
  }

  const session = await verifySessionCookie(token, {
    apiUrl: publicEnv.PUBLIC_AUTHIO_API_URL,
  });
  if (!session) {
    signInError("invalid_token");
  }

  cookies.set(COOKIE_NAME, token, {
    path: "/",
    httpOnly: true,
    secure: url.protocol === "https:",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
  });

  throw redirect(303, redirectTo);
};
