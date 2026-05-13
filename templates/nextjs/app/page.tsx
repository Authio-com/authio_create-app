import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1>Welcome to %PROJECT_NAME%</h1>
      <p>This starter is wired to Authio.</p>
      <ul>
        <li>
          <Link href="/sign-in">Sign in</Link>
        </li>
        <li>
          <Link href="/dashboard">Dashboard</Link> (protected)
        </li>
        <li>
          <Link href="/api/me">/api/me</Link> (route handler reading auth)
        </li>
      </ul>
      <p style={{ color: "#6b7280", fontSize: 14, marginTop: "2rem" }}>
        Edit <code>app/page.tsx</code> to make this your own. The middleware
        verifies the Authio session JWT against the cached JWKS at the edge.
      </p>
    </main>
  );
}
