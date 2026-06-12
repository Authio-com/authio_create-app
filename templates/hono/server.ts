import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { Authio, AuthioError } from "@useauthio/node";

const authio = new Authio({
  apiKey: process.env.AUTHIO_SECRET_KEY!,
  apiUrl: process.env.AUTHIO_API_URL,
});

const app = new Hono();

app.get("/", (c) => c.json({ name: "%PROJECT_NAME%", authio: "ready" }));

app.get("/me", async (c) => {
  const auth = c.req.header("authorization") ?? "";
  const m = /^Bearer\s+(.+)$/.exec(auth);
  if (!m) return c.json({ code: "missing_token" }, 401);
  const session = await authio.sessions.verify(m[1]!);
  if (!session) return c.json({ code: "invalid_token" }, 401);
  return c.json(session);
});

app.get("/me/memberships", async (c) => {
  const auth = c.req.header("authorization") ?? "";
  const m = /^Bearer\s+(.+)$/.exec(auth);
  if (!m) return c.json({ code: "missing_token" }, 401);
  const session = await authio.sessions.verify(m[1]!);
  if (!session) return c.json({ code: "invalid_token" }, 401);
  try {
    const memberships = await authio.users.listMemberships(session.userId);
    return c.json(memberships);
  } catch (err) {
    if (err instanceof AuthioError) {
      return c.json({ code: err.code, message: err.message }, err.status as 400);
    }
    throw err;
  }
});

const port = Number(process.env.PORT ?? 4000);
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`%PROJECT_NAME% listening on http://localhost:${info.port}`);
});
