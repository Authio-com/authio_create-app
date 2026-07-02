import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { JwtVerifier } from "@useauthio/node";
import { commitToken } from "~/lib/auth.server";

/**
 * Carry the error code across the bounce in a short-lived cookie instead
 * of `?error=` — query-string error codes leak into browser history,
 * access logs, and Referer headers. Read (and clear) the
 * `authio_signin_flash` cookie on your sign-in page.
 */
function signInErrorRedirect(code: string) {
  return redirect("/sign-in", {
    headers: {
      "Set-Cookie": `authio_signin_flash=${code}; Path=/; Max-Age=60; SameSite=Lax; Secure`,
    },
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("access_token");
  const redirectTo = url.searchParams.get("redirect") ?? "/dashboard";
  if (!token) {
    return signInErrorRedirect("missing_token");
  }
  const apiUrl = process.env.AUTHIO_API_URL ?? "https://api.authio.com";
  const verifier = new JwtVerifier(
    apiUrl,
    process.env.AUTHIO_JWT_ISSUER ?? "https://api.authio.com",
    process.env.AUTHIO_JWT_AUDIENCE ?? "authio",
  );
  try {
    await verifier.verify(token);
  } catch {
    return signInErrorRedirect("invalid_token");
  }
  return redirect(redirectTo, {
    headers: { "Set-Cookie": await commitToken(token) },
  });
}
