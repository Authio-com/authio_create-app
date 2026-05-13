import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import prompts from "prompts";
import kleur from "kleur";

type Framework = "nextjs" | "express" | "hono" | "skip";

const FRAMEWORKS: { id: Framework; label: string; hint: string }[] = [
  { id: "nextjs", label: "Next.js 15 (App Router)", hint: "Recommended" },
  { id: "express", label: "Express", hint: "Classic Node API" },
  { id: "hono", label: "Hono", hint: "Edge-friendly Node API" },
  { id: "skip", label: "Skip — just install the SDKs", hint: "Bring your own framework" },
];

interface CliArgs {
  name?: string;
  framework?: Framework;
  publishableKey?: string;
  yes?: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const out: CliArgs = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--framework" && argv[i + 1]) {
      out.framework = argv[++i] as Framework;
    } else if (arg === "--publishable-key" && argv[i + 1]) {
      out.publishableKey = argv[++i];
    } else if (arg === "--yes" || arg === "-y") {
      out.yes = true;
    } else if (!arg.startsWith("-") && !out.name) {
      out.name = arg;
    }
  }
  return out;
}

export async function run(argv: string[]): Promise<void> {
  const args = parseArgs(argv);

  console.log();
  console.log(kleur.bold().magenta("create-authio-app"));
  console.log(kleur.dim("  Scaffold a working app pre-wired to Authio."));
  console.log();

  let projectName = args.name;
  if (!projectName) {
    const r = await prompts({
      type: "text",
      name: "name",
      message: "Project name",
      initial: "my-authio-app",
      validate: (s: string) =>
        /^[a-z0-9._-]+$/.test(s) || "lowercase letters, numbers, dots, underscores, hyphens",
    });
    projectName = r.name as string | undefined;
    if (!projectName) {
      console.log(kleur.dim("aborted"));
      return;
    }
  }

  const targetDir = join(process.cwd(), projectName);
  if (existsSync(targetDir)) {
    const dir = await readdir(targetDir).catch(() => [] as string[]);
    if (dir.length > 0) {
      console.log(kleur.red(`error: ${projectName} already exists and is not empty`));
      process.exit(1);
    }
  } else {
    await mkdir(targetDir, { recursive: true });
  }

  let framework = args.framework;
  if (!framework && !args.yes) {
    const r = await prompts({
      type: "select",
      name: "framework",
      message: "Pick a framework",
      choices: FRAMEWORKS.map((f) => ({
        title: f.label,
        description: f.hint,
        value: f.id,
      })),
      initial: 0,
    });
    framework = r.framework as Framework | undefined;
    if (!framework) {
      console.log(kleur.dim("aborted"));
      return;
    }
  } else if (!framework) {
    framework = "nextjs";
  }

  let publishableKey = args.publishableKey;
  if (!publishableKey && !args.yes) {
    const r = await prompts({
      type: "text",
      name: "key",
      message: "Authio publishable key (pk_live_… or pk_test_…)",
      initial: "pk_test_PLACEHOLDER",
      hint: "Press Enter to use a placeholder; replace later in .env.local",
    });
    publishableKey = (r.key as string | undefined) ?? "pk_test_PLACEHOLDER";
  } else if (!publishableKey) {
    publishableKey = "pk_test_PLACEHOLDER";
  }

  console.log();
  console.log(kleur.dim(`  Scaffolding ${kleur.bold(framework)} app at ${kleur.bold(projectName)}...`));

  const here = dirname(fileURLToPath(import.meta.url));
  // dist/index.js or src/index.ts -> templates/<framework>
  const templateRoot = join(here, "..", "templates", framework);

  await copyTemplate(templateRoot, targetDir, {
    "%PROJECT_NAME%": projectName,
    "%AUTHIO_PUBLISHABLE_KEY%": publishableKey,
    "%AUTHIO_API_URL%": "https://authioauth-core-production.up.railway.app",
    "%AUTHIO_MGMT_API_URL%": "https://authiomanagement-api-production.up.railway.app",
  });

  console.log();
  console.log(kleur.green("  ✓ done"));
  console.log();
  console.log(kleur.bold("  Next steps:"));
  console.log();
  console.log(`    ${kleur.cyan("cd")} ${projectName}`);
  if (framework !== "skip") {
    console.log(`    ${kleur.cyan("pnpm install")}     ${kleur.dim("# or npm install / yarn")}`);
    console.log(`    ${kleur.cyan("pnpm dev")}`);
  }
  if (publishableKey === "pk_test_PLACEHOLDER") {
    console.log();
    console.log(
      `    ${kleur.yellow("→")} Replace ${kleur.bold("AUTHIO_PUBLISHABLE_KEY")} in .env.local`,
    );
    console.log(
      `    ${kleur.yellow("→")} Mint one via the dashboard at ${kleur.cyan("https://authiodashboard-production.up.railway.app/keys/new")}`,
    );
  }
  console.log();
  console.log(`    ${kleur.dim("Docs:")} ${kleur.cyan("https://authiodocs-production.up.railway.app")}`);
  console.log();
}

interface Substitutions {
  [token: string]: string;
}

async function copyTemplate(
  src: string,
  dst: string,
  subs: Substitutions,
): Promise<void> {
  if (!existsSync(src)) {
    throw new Error(`template not found: ${src}`);
  }
  const entries = await readdir(src);
  for (const entry of entries) {
    const srcPath = join(src, entry);
    // Templates ship `.gitignore` as `_gitignore` to avoid npm's pack stripping it,
    // and `package.json` as `package.json.template` to avoid pnpm tooling racing it.
    const renamed = entry === "_gitignore" ? ".gitignore" : entry.replace(/\.template$/, "");
    const dstPath = join(dst, renamed);
    const stats = await stat(srcPath);
    if (stats.isDirectory()) {
      await mkdir(dstPath, { recursive: true });
      await copyTemplate(srcPath, dstPath, subs);
      continue;
    }
    let contents = await readFile(srcPath, "utf-8");
    for (const [token, value] of Object.entries(subs)) {
      contents = contents.split(token).join(value);
    }
    await writeFile(dstPath, contents, "utf-8");
    process.stdout.write(`    ${kleur.dim("created ")}${relative(process.cwd(), dstPath)}\n`);
  }
}
