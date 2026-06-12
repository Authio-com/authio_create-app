import { auth } from "@authio.com/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId, orgId, role, sessionId } = await auth({
    apiUrl: process.env.NEXT_PUBLIC_AUTHIO_API_URL,
  });
  if (!userId) {
    return new Response(JSON.stringify({ code: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  return Response.json({ userId, orgId, role, sessionId });
}
