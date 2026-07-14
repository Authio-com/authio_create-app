import { createAuthioSignInHandler } from "@useauthio/nextjs/server";

export const { GET, POST } = createAuthioSignInHandler({
  apiUrl: process.env.NEXT_PUBLIC_AUTHIO_API_URL,
  hostedUiUrl: process.env.AUTHIO_HOSTED_UI_URL,
  callbackPath: "/api/auth/callback",
});

export const dynamic = "force-dynamic";
