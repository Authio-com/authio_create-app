import { createAuthioCallbackHandler } from "@authio/nextjs/server";

// Receives ?access_token=…&refresh_token=… from the Authio hosted
// sign-in flow, persists them as cookies, and redirects to /dashboard.
export const GET = createAuthioCallbackHandler({
  apiUrl: process.env.NEXT_PUBLIC_AUTHIO_API_URL,
  signedInRedirect: "/dashboard",
});

export const dynamic = "force-dynamic";
