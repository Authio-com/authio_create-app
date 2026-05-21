import type { Session } from "@authio/node";

declare global {
  namespace App {
    interface Locals {
      session: Session | null;
    }
  }
}

export {};
