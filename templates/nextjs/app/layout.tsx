import type { Metadata } from "next";
import { AuthioClientProvider } from "./AuthioClientProvider";

export const metadata: Metadata = {
  title: "%PROJECT_NAME%",
  description: "Built with Authio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          margin: 0,
          padding: "2rem",
          background: "#fafafa",
          color: "#0a0a0a",
        }}
      >
        <AuthioClientProvider
          apiUrl={
            process.env.NEXT_PUBLIC_AUTHIO_API_URL ??
            "https://identity.authio.com"
          }
          projectId={process.env.AUTHIO_PROJECT_ID ?? "proj_REPLACE_ME"}
        >
          {children}
        </AuthioClientProvider>
      </body>
    </html>
  );
}
