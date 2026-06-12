import { createAuthioMiddleware } from "@authio.com/nextjs";

// Drop-in Authio middleware. Handles the silent-refresh flow so users
// stay signed in for the full org-policy refresh window even though
// the access JWT rotates every 15 minutes.
//
// To allow public marketing pages, add them to `publicPaths`.
export default createAuthioMiddleware({
  publicPaths: ["/", "/sign-in", "/api/auth/", "/_next/", "/favicon"],
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
