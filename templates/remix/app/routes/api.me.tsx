import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getSession } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  if (!session) {
    return json({ code: "unauthorized" }, { status: 401 });
  }
  return json(session);
}
