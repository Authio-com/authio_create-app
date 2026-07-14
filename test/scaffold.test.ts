import { mkdtempSync, readFileSync, rmSync, statSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { run } from "../src/index";

describe("create-authio-app", () => {
  let workdir: string;
  let cwd: string;

  beforeEach(() => {
    cwd = process.cwd();
    workdir = mkdtempSync(join(tmpdir(), "create-authio-app-"));
    process.chdir(workdir);
  });

  afterEach(() => {
    process.chdir(cwd);
    rmSync(workdir, { recursive: true, force: true });
  });

  it("scaffolds a Next.js app with token substitution", async () => {
    await run([
      "demo-app",
      "--framework",
      "nextjs",
      "--publishable-key",
      "pk_test_xyz",
      "--yes",
    ]);
    const appDir = join(workdir, "demo-app");
    expect(statSync(appDir).isDirectory()).toBe(true);

    const env = readFileSync(join(appDir, ".env.example"), "utf-8");
    expect(env).toContain("NEXT_PUBLIC_AUTHIO_PUBLISHABLE_KEY=pk_test_xyz");
    expect(env).not.toContain("%AUTHIO_PUBLISHABLE_KEY%");

    const pkg = JSON.parse(readFileSync(join(appDir, "package.json"), "utf-8"));
    expect(pkg.name).toBe("demo-app");
    expect(pkg.dependencies["@useauthio/nextjs"]).toBeDefined();
    expect(pkg.dependencies.next).toBeDefined();

    const layout = readFileSync(join(appDir, "app", "layout.tsx"), "utf-8");
    expect(layout).toContain("AuthioProvider");
    expect(layout).toContain("demo-app");

    const middleware = readFileSync(join(appDir, "middleware.ts"), "utf-8");
    expect(middleware).toContain("createAuthioMiddleware");

    // 0.2 scaffold ships the three auth route handlers so the full
    // session lifecycle (sign-in + silent refresh + sign-out) works
    // out of the box.
    const callbackRoute = readFileSync(
      join(appDir, "app", "api", "auth", "callback", "route.ts"),
      "utf-8",
    );
    expect(callbackRoute).toContain("createAuthioCallbackHandler");
    expect(callbackRoute).toContain("verifyAccessToken: true");

    const signInRoute = readFileSync(
      join(appDir, "app", "api", "auth", "sign-in", "route.ts"),
      "utf-8",
    );
    expect(signInRoute).toContain("createAuthioSignInHandler");
    expect(
      readFileSync(join(appDir, "app", "sign-in", "page.tsx"), "utf-8"),
    ).toContain("/api/auth/sign-in?next=/dashboard");

    const refreshRoute = readFileSync(
      join(appDir, "app", "api", "auth", "refresh", "route.ts"),
      "utf-8",
    );
    expect(refreshRoute).toContain("createAuthioRefreshHandler");

    const signOutRoute = readFileSync(
      join(appDir, "app", "api", "auth", "sign-out", "route.ts"),
      "utf-8",
    );
    expect(signOutRoute).toContain("createAuthioSignOutHandler");

    expect(statSync(join(appDir, ".gitignore")).isFile()).toBe(true);
  });

  it("scaffolds an Express app", async () => {
    await run([
      "demo-express",
      "--framework",
      "express",
      "--publishable-key",
      "pk_test_xyz",
      "--yes",
    ]);
    const dir = join(workdir, "demo-express");
    const server = readFileSync(join(dir, "server.ts"), "utf-8");
    expect(server).toContain("import express");
    expect(server).toContain("authio.sessions.verify");
    expect(server).toContain("demo-express");
  });

  it("scaffolds a React Vite app that completes sign-in before navigation", async () => {
    await run([
      "demo-react",
      "--framework",
      "react-vite",
      "--publishable-key",
      "pk_test_react",
      "--project-id",
      "proj_react",
      "--yes",
    ]);
    const app = readFileSync(
      join(workdir, "demo-react", "src", "App.tsx"),
      "utf-8",
    );
    expect(app).toContain('path="/auth/callback"');
    expect(app).toContain("handleSignInResult(result)");
    expect(app).toContain("params.get(\"access_token\")");
    expect(app).toContain("navigate(\"/dashboard\", { replace: true })");
  });

  it("scaffolds a Hono app", async () => {
    await run([
      "demo-hono",
      "--framework",
      "hono",
      "--publishable-key",
      "pk_test_xyz",
      "--yes",
    ]);
    const dir = join(workdir, "demo-hono");
    const server = readFileSync(join(dir, "server.ts"), "utf-8");
    expect(server).toContain("import { Hono }");
    expect(server).toContain("authio.sessions.verify");
  });

  it("scaffolds a SvelteKit app", async () => {
    await run([
      "demo-sveltekit",
      "--framework",
      "sveltekit",
      "--publishable-key",
      "pk_test_svelte",
      "--yes",
    ]);
    const dir = join(workdir, "demo-sveltekit");
    expect(statSync(dir).isDirectory()).toBe(true);

    const env = readFileSync(join(dir, ".env.example"), "utf-8");
    expect(env).toContain("PUBLIC_AUTHIO_PUBLISHABLE_KEY=pk_test_svelte");
    expect(env).not.toContain("%AUTHIO_PUBLISHABLE_KEY%");

    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf-8"));
    expect(pkg.name).toBe("demo-sveltekit");
    expect(pkg.dependencies["@useauthio/svelte"]).toBeDefined();
    expect(pkg.dependencies["@useauthio/node"]).toBeDefined();
    expect(pkg.devDependencies["@sveltejs/kit"]).toBeDefined();

    const hooks = readFileSync(join(dir, "src", "hooks.server.ts"), "utf-8");
    expect(hooks).toContain("verifySessionCookie");
    expect(hooks).toContain("authio_session");

    const callback = readFileSync(
      join(dir, "src", "routes", "api", "auth", "callback", "+server.ts"),
      "utf-8",
    );
    expect(callback).toContain("access_token");
    expect(callback).toContain("cookies.set");
    expect(callback).toContain("safeRedirectPath");
    expect(callback).toContain('value.startsWith("//")');

    const dashboard = readFileSync(
      join(dir, "src", "routes", "dashboard", "+page.server.ts"),
      "utf-8",
    );
    expect(dashboard).toContain("locals.session");

    expect(statSync(join(dir, ".gitignore")).isFile()).toBe(true);
  });

  it("scaffolds a Remix app", async () => {
    await run([
      "demo-remix",
      "--framework",
      "remix",
      "--publishable-key",
      "pk_test_remix",
      "--yes",
    ]);
    const dir = join(workdir, "demo-remix");
    expect(statSync(dir).isDirectory()).toBe(true);

    const env = readFileSync(join(dir, ".env.example"), "utf-8");
    expect(env).toContain("AUTHIO_PUBLISHABLE_KEY=pk_test_remix");

    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf-8"));
    expect(pkg.dependencies["@remix-run/node"]).toBeDefined();
    expect(pkg.dependencies["@useauthio/node"]).toBeDefined();
    expect(pkg.dependencies["@useauthio/react"]).toBeDefined();

    const auth = readFileSync(
      join(dir, "app", "lib", "auth.server.ts"),
      "utf-8",
    );
    expect(auth).toContain("createCookieSessionStorage");
    expect(auth).toContain("JwtVerifier");

    const dashboard = readFileSync(
      join(dir, "app", "routes", "dashboard.tsx"),
      "utf-8",
    );
    expect(dashboard).toContain("requireSession");

    const callback = readFileSync(
      join(dir, "app", "routes", "auth.callback.tsx"),
      "utf-8",
    );
    expect(callback).toContain("access_token");
    expect(callback).toContain("safeRedirectPath");
    expect(callback).toContain('value.startsWith("//")');

    expect(statSync(join(dir, ".gitignore")).isFile()).toBe(true);
  });

  it("scaffolds a Laravel app", async () => {
    await run([
      "demo-laravel",
      "--framework",
      "laravel",
      "--publishable-key",
      "pk_test_laravel",
      "--yes",
      "--skip-prechecks",
    ]);
    const dir = join(workdir, "demo-laravel");
    expect(statSync(dir).isDirectory()).toBe(true);

    const composer = JSON.parse(
      readFileSync(join(dir, "composer.json"), "utf-8"),
    );
    expect(composer.name).toBe("authio/demo-laravel");
    expect(composer.require["authio/authio"]).toBeDefined();
    expect(composer.require["laravel/framework"]).toBeDefined();

    const env = readFileSync(join(dir, ".env.example"), "utf-8");
    expect(env).toContain("APP_NAME=demo-laravel");
    expect(env).toContain("AUTHIO_PUBLISHABLE_KEY=pk_test_laravel");

    const middleware = readFileSync(
      join(dir, "app", "Http", "Middleware", "AuthenticateWithAuthio.php"),
      "utf-8",
    );
    expect(middleware).toContain("$this->authio->verifyToken");

    const routes = readFileSync(join(dir, "routes", "web.php"), "utf-8");
    expect(routes).toContain("/dashboard");
    expect(routes).toContain("auth/sign-in");
    expect(routes).toContain("auth/callback");

    const signIn = readFileSync(
      join(dir, "resources", "views", "auth", "sign-in.blade.php"),
      "utf-8",
    );
    expect(signIn).toContain("magic-link/start");

    const callback = readFileSync(
      join(dir, "app", "Http", "Controllers", "AuthController.php"),
      "utf-8",
    );
    expect(callback).toContain("safeRedirectPath");
    expect(callback).toContain("str_starts_with($value, '//')");

    expect(statSync(join(dir, ".gitignore")).isFile()).toBe(true);
  });

  it("scaffolds a Rails app", async () => {
    await run([
      "demo-rails",
      "--framework",
      "rails",
      "--publishable-key",
      "pk_test_rails",
      "--yes",
      "--skip-prechecks",
    ]);
    const dir = join(workdir, "demo-rails");
    expect(statSync(dir).isDirectory()).toBe(true);

    const gemfile = readFileSync(join(dir, "Gemfile"), "utf-8");
    expect(gemfile).toContain('gem "rails"');
    expect(gemfile).toContain('gem "authio"');

    const env = readFileSync(join(dir, ".env.example"), "utf-8");
    expect(env).toContain("AUTHIO_PUBLISHABLE_KEY=pk_test_rails");

    const concern = readFileSync(
      join(
        dir,
        "app",
        "controllers",
        "concerns",
        "authio_authentication.rb",
      ),
      "utf-8",
    );
    expect(concern).toContain("authenticate_authio!");
    expect(concern).toContain("Authio::Client.default.verify_token");

    const routes = readFileSync(join(dir, "config", "routes.rb"), "utf-8");
    expect(routes).toContain("/auth/sign-in");
    expect(routes).toContain("/auth/callback");
    expect(routes).toContain("/dashboard");

    const sessions = readFileSync(
      join(dir, "app", "controllers", "sessions_controller.rb"),
      "utf-8",
    );
    expect(sessions).toContain("access_token");
    expect(sessions).toContain("cookies[:authio_session]");
    expect(sessions).toContain("safe_redirect_path");
    expect(sessions).toContain('candidate.start_with?("//")');

    expect(statSync(join(dir, ".gitignore")).isFile()).toBe(true);
  });

  it("accepts --framework=name (equals form)", async () => {
    await run([
      "demo-eq",
      "--framework=sveltekit",
      "--publishable-key=pk_test_eq",
      "--yes",
    ]);
    const dir = join(workdir, "demo-eq");
    expect(existsSync(join(dir, "svelte.config.js"))).toBe(true);
  });

  it("rejects an unknown framework", async () => {
    const exit = vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
      throw new Error(`exit:${code}`);
    }) as never);
    await expect(
      run([
        "demo-bad",
        "--framework",
        "nonexistent",
        "--yes",
      ]),
    ).rejects.toThrow(/exit:1/);
    exit.mockRestore();
  });

  it("scaffolds a skip target", async () => {
    await run([
      "demo-skip",
      "--framework",
      "skip",
      "--publishable-key",
      "pk_test_xyz",
      "--yes",
    ]);
    const dir = join(workdir, "demo-skip");
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf-8"));
    expect(pkg.dependencies["@useauthio/node"]).toBeDefined();
    expect(pkg.dependencies["@useauthio/react"]).toBeDefined();
  });
});
