import { createAuthioRefreshHandler } from "@authio.com/nextjs/server";

// Silent BFF cookie auto-renewal. The middleware redirects here when
// the access cookie has expired but the refresh cookie is still
// present. On success, rotates both cookies and 302s back to ?next=.
export const GET = createAuthioRefreshHandler({
  apiUrl: process.env.NEXT_PUBLIC_AUTHIO_API_URL,
});

export const dynamic = "force-dynamic";
