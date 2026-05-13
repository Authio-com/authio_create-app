import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
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
    expect(pkg.dependencies["@authio/nextjs"]).toBeDefined();
    expect(pkg.dependencies.next).toBeDefined();

    const layout = readFileSync(join(appDir, "app", "layout.tsx"), "utf-8");
    expect(layout).toContain("AuthioProvider");
    expect(layout).toContain("demo-app");

    const middleware = readFileSync(join(appDir, "middleware.ts"), "utf-8");
    expect(middleware).toContain("authMiddleware");

    // _gitignore should be renamed to .gitignore
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
    expect(pkg.dependencies["@authio/node"]).toBeDefined();
    expect(pkg.dependencies["@authio/react"]).toBeDefined();
  });
});
