import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { JwtVerifier, type Session } from "@authio/node";

const apiUrl = process.env.AUTHIO_API_URL ?? "https://api.authio.com";
const sessionSecret = process.env.SESSION_SECRET ?? "dev-only-session-secret-please-rotate";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "authio_session",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
  },
});

const verifier = new JwtVerifier(
  apiUrl,
  process.env.AUTHIO_JWT_ISSUER ?? "https://api.authio.com",
  process.env.AUTHIO_JWT_AUDIENCE ?? "authio",
);

const RESERVED_JWT_CLAIMS = new Set([
  "iss",
  "sub",
  "aud",
  "exp",
  "iat",
  "jti",
  "nbf",
  "scope",
  "scopes",
  "sid",
  "act_org",
  "act_role",
  "client_id",
  "token_type",
  "project_id",
  "is_impersonation",
  "impersonator_user_id",
  "impersonator_email",
  "imp_grant_id",
]);

export async function getSession(
  request: Request,
): Promise<Session | null> {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  const token = session.get("token") as string | undefined;
  if (!token) return null;
  try {
    const claims = await verifier.verify(token);
    const merged: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(claims)) {
      if (RESERVED_JWT_CLAIMS.has(k)) continue;
      merged[k] = v;
    }
    return {
      sessionId: claims.sid ?? "",
      userId: claims.sub,
      orgId: claims.act_org ? claims.act_org : null,
      role: claims.act_role ? claims.act_role : null,
      expiresAt: claims.exp
        ? new Date(claims.exp * 1000).toISOString()
        : new Date().toISOString(),
      claims: merged as Record<string, never>,
    };
  } catch {
    return null;
  }
}

export async function requireSession(
  request: Request,
  redirectTo?: string,
): Promise<Session> {
  const session = await getSession(request);
  if (!session) {
    const url = new URL(request.url);
    const target = redirectTo ?? url.pathname + url.search;
    throw redirect(`/sign-in?redirect_url=${encodeURIComponent(target)}`);
  }
  return session;
}

export async function commitToken(token: string): Promise<string> {
  const session = await sessionStorage.getSession();
  session.set("token", token);
  return sessionStorage.commitSession(session);
}

export async function destroy(request: Request): Promise<string> {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  return sessionStorage.destroySession(session);
}
