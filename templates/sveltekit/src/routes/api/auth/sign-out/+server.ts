import { redirect, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ cookies }) => {
  cookies.delete("authio_session", { path: "/" });
  throw redirect(303, "/");
};
