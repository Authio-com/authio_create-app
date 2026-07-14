import { createAuthioCallbackHandler } from "@useauthio/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";

// Receives ?access_token=…&refresh_token=… from the Authio hosted
// sign-in flow, persists them as cookies, and redirects to /dashboard.
const completeCallback = createAuthioCallbackHandler({
  apiUrl: process.env.NEXT_PUBLIC_AUTHIO_API_URL,
  signedInRedirect: "/dashboard",
  verifyAccessToken: true,
});

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const callbackState =
    url.searchParams.get("client_state_nonce") ?? url.searchParams.get("state");
  const cookieState = request.cookies.get("authio_callback_state")?.value;

  if (!callbackState || !cookieState || callbackState !== cookieState) {
    const response = NextResponse.redirect(new URL("/sign-in", request.url));
    response.cookies.set("authio_callback_state", "", {
      maxAge: 0,
      path: "/",
    });
    return response;
  }

  return completeCallback(request);
}

export const dynamic = "force-dynamic";
