"use client";

import { AuthioProvider } from "@useauthio/react";

export function AuthioClientProvider({
  children,
  apiUrl,
  projectId,
}: {
  children: React.ReactNode;
  apiUrl: string;
  projectId: string;
}) {
  return (
    <AuthioProvider apiUrl={apiUrl} projectId={projectId}>
      {children}
    </AuthioProvider>
  );
}
