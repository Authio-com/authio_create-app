import type { Session } from "@authio.com/node";

declare global {
  namespace App {
    interface Locals {
      session: Session | null;
    }
  }
}

export {};
