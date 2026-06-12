import { SignIn } from "@useauthio/react";

export default function SignInPage() {
  return (
    <main style={{ maxWidth: 420, margin: "0 auto" }}>
      <h1>Sign in</h1>
      <SignIn redirectAfter="/dashboard" />
    </main>
  );
}
