import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthioProvider } from "@useauthio/react";
import { App } from "./App";

const root = document.getElementById("root");
if (!root) throw new Error("missing #root");

createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthioProvider
        apiUrl={import.meta.env.VITE_AUTHIO_API_URL ?? "https://auth-api.authio.com"}
        projectId={import.meta.env.VITE_AUTHIO_PROJECT_ID ?? "proj_REPLACE_ME"}
        signInUrl={
          import.meta.env.VITE_AUTHIO_SIGN_IN_URL ?? "https://lobby.authio.com/"
        }
      >
        <App />
      </AuthioProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
