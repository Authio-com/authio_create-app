import { redirect, type RequestHandler } from "@sveltejs/kit";
import { verifySessionCookie } from "@authio/svelte/server";
import { env as publicEnv } from "$env/dynamic/public";

const COOKIE_NAME = "authio_session";
const COOKIE_MAX_AGE = 60 * 60 * 8;

export const GET: RequestHandler = async ({ url, cookies }) => {
  const token = url.searchParams.get("access_token");
  const redirectTo = url.searchParams.get("redirect") ?? "/dashboard";
  if (!token) {
    throw redirect(303, "/sign-in?error=missing_token");
  }

  const session = await verifySessionCookie(token, {
    apiUrl: publicEnv.PUBLIC_AUTHIO_API_URL,
  });
  if (!session) {
    throw redirect(303, "/sign-in?error=invalid_token");
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
