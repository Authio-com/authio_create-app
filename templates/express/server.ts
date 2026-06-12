import express from "express";
import { Authio, AuthioError } from "@authio.com/node";

const authio = new Authio({
  apiKey: process.env.AUTHIO_SECRET_KEY!,
  apiUrl: process.env.AUTHIO_API_URL,
});

const app = express();
app.use(express.json());

// Verify the Authio session JWT in the Authorization header.
async function requireSession(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const auth = req.header("authorization") ?? "";
  const m = /^Bearer\s+(.+)$/.exec(auth);
  if (!m) return res.status(401).json({ code: "missing_token" });
  const session = await authio.sessions.verify(m[1]!);
  if (!session) return res.status(401).json({ code: "invalid_token" });
  (req as any).session = session;
  next();
}

app.get("/", (_req, res) => {
  res.json({ name: "%PROJECT_NAME%", authio: "ready" });
});

app.get("/me", requireSession, async (req, res) => {
  const session = (req as any).session;
  // session.userId is always set; session.orgId may be null for users
  // who haven't yet selected one of their organizations.
  res.json(session);
});

app.get("/me/memberships", requireSession, async (req, res) => {
  const session = (req as any).session;
  try {
    const memberships = await authio.users.listMemberships(session.userId);
    res.json(memberships);
  } catch (err) {
    if (err instanceof AuthioError) {
      return res.status(err.status).json({ code: err.code, message: err.message });
    }
    throw err;
  }
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`%PROJECT_NAME% listening on http://localhost:${port}`);
});
