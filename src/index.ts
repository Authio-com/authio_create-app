import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import prompts from "prompts";
import kleur from "kleur";

type Framework =
  | "nextjs"
  | "react-vite"
  | "vue-vite"
  | "express"
  | "hono"
  | "sveltekit"
  | "remix"
  | "laravel"
  | "rails"
  | "skip";

const FRAMEWORKS: { id: Framework; label: string; hint: string }[] = [
  { id: "nextjs", label: "Next.js 15 (App Router)", hint: "Recommended" },
  { id: "react-vite", label: "React + Vite (SPA)", hint: "Pure client-side, @authio/react" },
  { id: "vue-vite", label: "Vue 3 + Vite (SPA)", hint: "Pure client-side, @authio/vue" },
  { id: "sveltekit", label: "SvelteKit", hint: "Svelte 5 + Vite" },
  { id: "remix", label: "Remix", hint: "React + loaders/actions" },
  { id: "express", label: "Express", hint: "Classic Node API" },
  { id: "hono", label: "Hono", hint: "Edge-friendly Node API" },
  { id: "laravel", label: "Laravel 11", hint: "PHP 8.2+" },
  { id: "rails", label: "Rails 7.1", hint: "Ruby 3.2+" },
  { id: "skip", label: "Skip — just install the SDKs", hint: "Bring your own framework" },
];

interface CliArgs {
  name?: string;
  framework?: Framework;
  publishableKey?: string;
  projectId?: string;
  yes?: boolean;
  skipPrechecks?: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const out: CliArgs = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--framework" && argv[i + 1]) {
      out.framework = argv[++i] as Framework;
    } else if (arg.startsWith("--framework=")) {
      out.framework = arg.slice("--framework=".length) as Framework;
    } else if (arg === "--publishable-key" && argv[i + 1]) {
      out.publishableKey = argv[++i];
    } else if (arg.startsWith("--publishable-key=")) {
      out.publishableKey = arg.slice("--publishable-key=".length);
    } else if (arg === "--project-id" && argv[i + 1]) {
      out.projectId = argv[++i];
    } else if (arg.startsWith("--project-id=")) {
      out.projectId = arg.slice("--project-id=".length);
    } else if (arg === "--yes" || arg === "-y") {
      out.yes = true;
    } else if (arg === "--skip-prechecks") {
      out.skipPrechecks = true;
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

  if (!FRAMEWORKS.some((f) => f.id === framework)) {
    console.log(
      kleur.red(
        `error: unknown framework "${framework}". Supported: ${FRAMEWORKS.map(
          (f) => f.id,
        ).join(", ")}`,
      ),
    );
    process.exit(1);
  }

  if (!args.skipPrechecks) {
    const issue = checkPrerequisites(framework);
    if (issue) {
      console.log(kleur.red(`error: ${issue}`));
      console.log(
        kleur.dim(
          "  Re-run with --skip-prechecks if you have a non-standard install.",
        ),
      );
      process.exit(1);
    }
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

  // SPA-shaped templates (react-vite / vue-vite) need a project ID rather
  // than a publishable key — they hit auth-core directly via CORS and
  // identify themselves through the X-Authio-Project header. If the user
  // didn't pass --project-id, prompt for one inline.
  let projectId = args.projectId;
  if (
    (framework === "react-vite" || framework === "vue-vite") &&
    !projectId &&
    !args.yes
  ) {
    const r = await prompts({
      type: "text",
      name: "id",
      message: "Authio project ID (proj_…)",
      initial: "proj_REPLACE_ME",
      hint: "Press Enter to use a placeholder; replace later in .env.local",
    });
    projectId = (r.id as string | undefined) ?? "proj_REPLACE_ME";
  } else if (
    (framework === "react-vite" || framework === "vue-vite") &&
    !projectId
  ) {
    projectId = "proj_REPLACE_ME";
  }

  console.log();
  console.log(kleur.dim(`  Scaffolding ${kleur.bold(framework)} app at ${kleur.bold(projectName)}...`));

  const here = dirname(fileURLToPath(import.meta.url));
  // dist/index.js or src/index.ts -> templates/<framework>
  const templateRoot = join(here, "..", "templates", framework);

  await copyTemplate(templateRoot, targetDir, {
    "%PROJECT_NAME%": projectName,
    "%PROJECT_ID%": projectId ?? args.projectId ?? "",
    "%AUTHIO_PUBLISHABLE_KEY%": publishableKey,
    "%AUTHIO_API_URL%": "https://auth-api.authio.com",
    "%AUTHIO_MGMT_API_URL%": "https://api.authio.com",
  });

  console.log();
  console.log(kleur.green("  ✓ done"));
  console.log();
  console.log(kleur.bold("  Next steps:"));
  console.log();
  console.log(`    ${kleur.cyan("cd")} ${projectName}`);
  printNextSteps(framework);

  if (publishableKey === "pk_test_PLACEHOLDER") {
    console.log();
    console.log(
      `    ${kleur.yellow("→")} Replace ${kleur.bold("AUTHIO_PUBLISHABLE_KEY")} in .env / .env.local`,
    );
    console.log(
      `    ${kleur.yellow("→")} Mint one via the dashboard at ${kleur.cyan("https://dashboard.authio.com/keys/new")}`,
    );
  }
  console.log();
  console.log(`    ${kleur.dim("Docs:")} ${kleur.cyan("https://docs.authio.com")}`);
  console.log();
}

function printNextSteps(framework: Framework): void {
  switch (framework) {
    case "nextjs":
    case "react-vite":
    case "vue-vite":
    case "remix":
    case "sveltekit":
    case "express":
    case "hono":
      console.log(`    ${kleur.cyan("pnpm install")}     ${kleur.dim("# or npm install / yarn")}`);
      console.log(`    ${kleur.cyan("pnpm dev")}`);
      break;
    case "laravel":
      console.log(`    ${kleur.cyan("composer install")}`);
      console.log(`    ${kleur.cyan("cp .env.example .env && php artisan key:generate")}`);
      console.log(`    ${kleur.cyan("php artisan serve")}`);
      break;
    case "rails":
      console.log(`    ${kleur.cyan("bundle install")}`);
      console.log(`    ${kleur.cyan("cp .env.example .env")}`);
      console.log(`    ${kleur.cyan("bin/rails server")}`);
      break;
    case "skip":
      break;
  }
}

function checkPrerequisites(framework: Framework): string | null {
  switch (framework) {
    case "nextjs":
    case "react-vite":
    case "vue-vite":
    case "express":
    case "hono":
    case "sveltekit":
    case "remix":
    case "skip":
      return checkNode();
    case "laravel":
      return checkPhp() ?? checkComposer();
    case "rails":
      return checkRuby() ?? checkBundler();
  }
}

function checkNode(): string | null {
  const major = Number(process.versions.node.split(".")[0]);
  if (!Number.isFinite(major) || major < 20) {
    return `Node.js 20+ required (you have ${process.versions.node}).`;
  }
  return null;
}

function checkPhp(): string | null {
  const out = tryExec("php -v");
  if (out === null) {
    return "PHP 8.2+ required. Install from https://www.php.net/downloads.";
  }
  const m = /PHP\s+(\d+)\.(\d+)/i.exec(out);
  if (!m) return null;
  const major = Number(m[1]);
  const minor = Number(m[2]);
  if (major < 8 || (major === 8 && minor < 2)) {
    return `PHP 8.2+ required (you have ${major}.${minor}).`;
  }
  return null;
}

function checkComposer(): string | null {
  if (tryExec("composer --version") === null) {
    return "Composer is required. Install from https://getcomposer.org/.";
  }
  return null;
}

function checkRuby(): string | null {
  const out = tryExec("ruby --version");
  if (out === null) {
    return "Ruby 3.2+ required. Install via rbenv / asdf / system package manager.";
  }
  const m = /ruby\s+(\d+)\.(\d+)/i.exec(out);
  if (!m) return null;
  const major = Number(m[1]);
  const minor = Number(m[2]);
  if (major < 3 || (major === 3 && minor < 2)) {
    return `Ruby 3.2+ required (you have ${major}.${minor}). Try \`rbenv install 3.3.0\`.`;
  }
  return null;
}

function checkBundler(): string | null {
  if (tryExec("bundle --version") === null) {
    return "Bundler is required. Run `gem install bundler`.";
  }
  return null;
}

function tryExec(cmd: string): string | null {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString();
  } catch {
    return null;
  }
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
