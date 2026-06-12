import type { Session } from "@useauthio/node";

declare global {
  namespace App {
    interface Locals {
      session: Session | null;
    }
  }
}

export {};
