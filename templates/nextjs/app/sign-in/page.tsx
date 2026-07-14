export default function SignInPage() {
  return (
    <main style={{ maxWidth: 420, margin: "0 auto" }}>
      <h1>Sign in</h1>
      <p>Continue to Authio's secure sign-in flow.</p>
      <a href="/api/auth/sign-in?next=/dashboard">Sign in</a>
    </main>
  );
}
