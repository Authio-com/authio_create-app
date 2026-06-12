import { writable, type Writable } from "svelte/store";
import type { Session } from "@authio.com/node";

export interface AuthioUserStore {
  isLoaded: boolean;
  session: Session | null;
}

const initial: AuthioUserStore = { isLoaded: false, session: null };

export const authio: Writable<AuthioUserStore> = writable(initial);

export function setSession(session: Session | null): void {
  authio.set({ isLoaded: true, session });
}
