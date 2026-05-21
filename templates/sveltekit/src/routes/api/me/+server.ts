import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = ({ locals }) => {
  if (!locals.session) {
    return json({ code: "unauthorized" }, { status: 401 });
  }
  return json(locals.session);
};
