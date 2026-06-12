import { auth } from "@authio.com/nextjs/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId, orgId, role } = await auth({
    apiUrl: process.env.NEXT_PUBLIC_AUTHIO_API_URL,
  });
  if (!userId) {
    return (
      <main style={{ maxWidth: 600, margin: "0 auto" }}>
        <h1>Dashboard</h1>
        <p>You aren&apos;t signed in.</p>
        <p>
          <Link href="/sign-in">Sign in</Link>
        </p>
      </main>
    );
  }
  return (
    <main style={{ maxWidth: 600, margin: "0 auto" }}>
      <h1>Dashboard</h1>
      <p>
        Signed in as <code>{userId}</code>
      </p>
      <p>
        Active organization:{" "}
        <code>{orgId ?? "(none selected — multi-org user)"}</code>
      </p>
      {role && (
        <p>
          Role: <code>{role}</code>
        </p>
      )}
      <p style={{ marginTop: 24, color: "#6b7280", fontSize: 14 }}>
        This page is protected by middleware.ts. The session is verified
        against the cached JWKS at the edge with no round-trip to auth-core.
      </p>
    </main>
  );
}
