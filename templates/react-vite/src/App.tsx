import { useState, type FormEvent } from "react";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import {
  useAuthio,
  useAuthioRequired,
  SignedIn,
  SignedOut,
  signInWithMagicLink,
  signInWithPasskey,
} from "@authio.com/react";

const apiUrl =
  import.meta.env.VITE_AUTHIO_API_URL ?? "https://auth-api.authio.com";
const projectId = import.meta.env.VITE_AUTHIO_PROJECT_ID ?? "proj_REPLACE_ME";

export function App() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "2rem",
        }}
      >
        <h1 style={{ margin: 0 }}>%PROJECT_NAME%</h1>
        <nav style={{ display: "flex", gap: "1rem" }}>
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
        </nav>
      </header>

      <SignedIn>
        <SignOutBar />
      </SignedIn>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

function Home() {
  return (
    <main>
      <SignedOut>
        <p>You are signed out. Try signing in below.</p>
        <SignIn />
      </SignedOut>
      <SignedIn>
        <p>You are signed in. Visit the <Link to="/dashboard">dashboard</Link>.</p>
      </SignedIn>
    </main>
  );
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleMagicLink(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      await signInWithMagicLink({
        apiUrl,
        projectId,
        email,
        redirectUri: window.location.origin + "/dashboard",
      });
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "unknown error");
    }
  }

  async function handlePasskey() {
    setStatus("sending");
    setError(null);
    try {
      await signInWithPasskey({ apiUrl, projectId, email });
      navigate("/dashboard");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "unknown error");
    }
  }

  return (
    <form onSubmit={handleMagicLink} style={{ display: "grid", gap: "1rem" }}>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            display: "block",
            width: "100%",
            padding: "0.5rem",
            marginTop: "0.25rem",
          }}
        />
      </label>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="submit" disabled={status === "sending"}>
          {status === "sending"
            ? "Sending..."
            : status === "sent"
              ? "Sent — check your email"
              : "Send magic link"}
        </button>
        <button type="button" onClick={handlePasskey} disabled={!email}>
          Sign in with passkey
        </button>
      </div>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </form>
  );
}

function Dashboard() {
  const { user } = useAuthioRequired({
    fallback: <p>Loading...</p>,
    redirectTo: "/sign-in",
  });
  if (!user) return null;
  return (
    <main>
      <h2>Dashboard</h2>
      <p>Signed in as {user.email}.</p>
      <pre
        style={{
          background: "#f4f4f5",
          padding: "1rem",
          borderRadius: 6,
          overflow: "auto",
        }}
      >
        {JSON.stringify(user, null, 2)}
      </pre>
    </main>
  );
}

function SignOutBar() {
  const { user, signOut } = useAuthio();
  return (
    <div
      style={{
        background: "#f4f4f5",
        padding: "0.75rem 1rem",
        borderRadius: 6,
        marginBottom: "1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span>Signed in as {user?.email}</span>
      <button type="button" onClick={() => void signOut()}>
        Sign out
      </button>
    </div>
  );
}
