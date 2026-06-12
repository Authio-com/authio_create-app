import { createAuthioSignOutHandler } from "@useauthio/nextjs/server";

// Clears both Authio cookies and (best-effort) revokes the underlying
// session row against auth-core. Accepts GET so the sidebar sign-out
// button can be a plain link, and POST for form submissions.
export const { GET, POST } = createAuthioSignOutHandler({
  apiUrl: process.env.NEXT_PUBLIC_AUTHIO_API_URL,
});

export const dynamic = "force-dynamic";
