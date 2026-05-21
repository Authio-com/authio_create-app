import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getSession } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  return { session };
}

export default function Index() {
  const { session } = useLoaderData<typeof loader>();
  return (
    <main style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1>Welcome to %PROJECT_NAME%</h1>
      <p>This Remix starter is wired to Authio.</p>
      {session ? (
        <p>
          Signed in as <code>{session.userId}</code> ·{" "}
          <Link to="/dashboard">Dashboard</Link> ·{" "}
          <form
            method="post"
            action="/sign-out"
            style={{ display: "inline" }}
          >
            <button type="submit">Sign out</button>
          </form>
        </p>
      ) : (
        <ul>
          <li>
            <Link to="/sign-in">Sign in</Link>
          </li>
          <li>
            <Link to="/dashboard">Dashboard</Link> (protected)
          </li>
          <li>
            <Link to="/api/me">/api/me</Link> (loader-only JSON)
          </li>
        </ul>
      )}
      <p style={{ color: "#6b7280", fontSize: 14, marginTop: "2rem" }}>
        Edit <code>app/routes/_index.tsx</code> to make this your own. Loaders
        verify the Authio session JWT against the cached JWKS in
        <code> app/lib/auth.server.ts</code>.
      </p>
    </main>
  );
}
