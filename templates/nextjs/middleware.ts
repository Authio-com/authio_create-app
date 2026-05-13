import { authMiddleware } from "@authio/nextjs";

export default authMiddleware({
  apiUrl: process.env.NEXT_PUBLIC_AUTHIO_API_URL,
  publicRoutes: ["/", "/sign-in", /^\/api\/public\//],
  signInUrl: "/sign-in",
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
