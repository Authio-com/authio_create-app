import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { JwtVerifier } from "@useauthio/node";
import { commitToken } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("access_token");
  const redirectTo = url.searchParams.get("redirect") ?? "/dashboard";
  if (!token) {
    return redirect("/sign-in?error=missing_token");
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
    return redirect("/sign-in?error=invalid_token");
  }
  return redirect(redirectTo, {
    headers: { "Set-Cookie": await commitToken(token) },
  });
}
