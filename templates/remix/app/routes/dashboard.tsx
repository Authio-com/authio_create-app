import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { requireSession } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await requireSession(request);
  return { session };
}

export default function Dashboard() {
  const { session } = useLoaderData<typeof loader>();
  return (
    <main style={{ maxWidth: 600, margin: "0 auto" }}>
      <h1>Dashboard</h1>
      <p>
        Signed in as <code>{session.userId}</code>
      </p>
      <p>
        Active organization:{" "}
        <code>{session.orgId ?? "(none selected — multi-org user)"}</code>
      </p>
      {session.role && (
        <p>
          Role: <code>{session.role}</code>
        </p>
      )}
      <Form method="post" action="/sign-out" style={{ marginTop: 24 }}>
        <button
          type="submit"
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            background: "#0a0a0a",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </Form>
      <p style={{ marginTop: 24, color: "#6b7280", fontSize: 14 }}>
        This loader calls <code>requireSession()</code>, which verifies the
        Authio session JWT against the cached JWKS.
      </p>
    </main>
  );
}
