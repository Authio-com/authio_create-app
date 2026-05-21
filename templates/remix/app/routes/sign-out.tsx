import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { destroy } from "~/lib/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  return redirect("/", {
    headers: { "Set-Cookie": await destroy(request) },
  });
}

export async function loader() {
  return redirect("/");
}
