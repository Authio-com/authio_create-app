import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ locals, url }) => {
  if (!locals.session) {
    throw redirect(
      303,
      `/sign-in?redirect_url=${encodeURIComponent(url.pathname)}`,
    );
  }
  return { session: locals.session };
};
