/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTHIO_API_URL?: string;
  readonly VITE_AUTHIO_PROJECT_ID?: string;
  readonly VITE_AUTHIO_SIGN_IN_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
