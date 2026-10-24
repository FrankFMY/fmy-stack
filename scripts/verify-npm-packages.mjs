import { execFileSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const target = mkdtempSync(join(tmpdir(), "fmy-stack-packages-"));
const packages = [
  ["packages/core", "@frankfmy/core"],
  ["packages/validation", "@frankfmy/validation"],
  ["packages/db-utils", "@frankfmy/db-utils"],
  ["packages/elysia-kit", "@frankfmy/elysia-kit"],
  ["packages/ui", "@frankfmy/ui"],
];

try {
  const tarballs = new Map();
  const registry = process.env.FMY_REGISTRY === "1";
  for (const [directory, expectedName] of packages) {
    const cwd = join(root, directory);
    if (registry) {
      const version = JSON.parse(readFileSync(join(cwd, "package.json"), "utf8")).version;
      tarballs.set(expectedName, `${expectedName}@${version}`);
      continue;
    }
    const output = execFileSync("npm", ["pack", "--silent", "--pack-destination", target], {
      cwd,
      encoding: "utf8",
    }).trim();
    const tarball = join(target, output.split("\n").at(-1));
    const entries = execFileSync("tar", ["-tzf", tarball], { encoding: "utf8" })
      .trim()
      .split("\n");
    for (const required of ["package/package.json", "package/LICENSE", "package/NOTICE", "package/README.md"]) {
      if (!entries.includes(required)) throw new Error(`${expectedName} is missing ${required}`);
    }
    if (entries.some((entry) => /(?:^|\/)(?:__tests__|tests)(?:\/|$)|\.test\.|\.spec\./u.test(entry))) {
      throw new Error(`${expectedName} contains test artifacts`);
    }
    const manifest = JSON.parse(
      execFileSync("tar", ["-xOzf", tarball, "package/package.json"], { encoding: "utf8" }),
    );
    if (
      manifest.name !== expectedName ||
      manifest.version !== (expectedName === "@frankfmy/db-utils" || expectedName === "@frankfmy/elysia-kit" ? "2.0.0" : "1.1.2") ||
      manifest.license !== "Apache-2.0" ||
      manifest.private === true ||
      JSON.stringify(manifest).includes("workspace:")
    ) {
      throw new Error(`${expectedName} manifest contract failed`);
    }
    const assertTargets = (value) => {
      if (typeof value === "string" && value.startsWith("./") && !entries.includes(`package/${value.slice(2)}`)) {
        throw new Error(`${expectedName} is missing export target ${value}`);
      }
      if (value && typeof value === "object") for (const child of Object.values(value)) assertTargets(child);
    };
    assertTargets(manifest.exports);
    tarballs.set(expectedName, tarball);
  }

  const consumer = join(target, "consumer");
  execFileSync("mkdir", ["-p", consumer]);
  execFileSync("npm", ["init", "-y"], { cwd: consumer, stdio: "pipe" });
  execFileSync(
    "npm",
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      tarballs.get("@frankfmy/core"),
      tarballs.get("@frankfmy/validation"),
      tarballs.get("@frankfmy/db-utils"),
      tarballs.get("@frankfmy/elysia-kit"),
      tarballs.get("@frankfmy/ui"),
      "drizzle-orm@0.45.2",
      "elysia@1.4.29",
      "svelte@5.56.10",
      "@electric-sql/pglite@0.5.11",
      "typescript@6.0.3",
      "@types/node@26.3.0",
      "vite@8.3.5",
      "@sveltejs/vite-plugin-svelte@7.3.0",
      "@tailwindcss/vite@4.3.3",
      "tailwindcss@4.3.3",
    ],
    { cwd: consumer, stdio: "pipe" },
  );
  writeFileSync(
    join(consumer, "check.mjs"),
    [
      'import { readFile } from "node:fs/promises";',
      'import * as core from "@frankfmy/core";',
      'import * as validation from "@frankfmy/validation";',
      'import * as db from "@frankfmy/db-utils";',
      'import * as elysia from "@frankfmy/elysia-kit";',
      'if (typeof core.hashPassword !== "function" || typeof core.passwordHashNeedsRehash !== "function") process.exit(1);',
      'if (!(await core.verifyPassword("LegacyBcryptPassword123!", "$2b$12$DKkEsLrnJQg02Un/g60W.uvISNfLejX0xomyooHVRyEpi31KhqIdi"))) process.exit(1);',
      'if (typeof validation.validate !== "function" || typeof db.paginate !== "function" || typeof db.buildFullTextSearch !== "function" || typeof db.getSoftDeleteValues !== "function" || typeof db.getRestoreValues !== "function" || typeof db.fakeData !== "object" || typeof elysia.rateLimiter !== "function") process.exit(1);',
      'const styles = import.meta.resolve("@frankfmy/ui/styles.css");',
      'const uiRoot = import.meta.resolve("@frankfmy/ui");',
      'if (!(await readFile(new URL(uiRoot), "utf8")).includes(".svelte")) process.exit(1);',
      'if (!(await readFile(new URL(styles), "utf8")).includes("@source")) process.exit(1);',
      'console.log("coordinated installed package exports: PASS");',
      "",
    ].join("\n"),
  );
  execFileSync(process.execPath, [join(consumer, "check.mjs")], {
    cwd: consumer,
    stdio: "inherit",
    timeout: 5_000,
  });
  copyFileSync(join(root, "scripts/consumer-runtime.mjs"), join(consumer, "runtime.mjs"));
  execFileSync(process.execPath, ["runtime.mjs"], { cwd: consumer, stdio: "inherit", timeout: 60_000 });
  execFileSync("bun", ["runtime.mjs"], { cwd: consumer, stdio: "inherit", timeout: 60_000 });
  for (const [writer, reader] of [[process.execPath, "bun"], ["bun", process.execPath]]) {
    execFileSync(writer, ["runtime.mjs", "write", "password-hash.txt"], { cwd: consumer, stdio: "inherit" });
    execFileSync(reader, ["runtime.mjs", "verify", "password-hash.txt"], { cwd: consumer, stdio: "inherit" });
  }
  writeFileSync(join(consumer, "package.json"), JSON.stringify({ ...JSON.parse(readFileSync(join(consumer, "package.json"), "utf8")), type: "module" }));
  writeFileSync(join(consumer, "consumer.ts"), `
import { formatDateRU, formatMoneyRU, hashPassword } from '@frankfmy/core';
import { EmailSchema, UserCreateSchema, validate, type Email } from '@frankfmy/validation';
import { Elysia } from 'elysia';
import { authPlugin } from '@frankfmy/elysia-kit';
const email: Email = EmailSchema.assert('reader@example.com');
validate(UserCreateSchema, { name: 'Reader', email, password: 'Long-Password-123!' });
formatDateRU(new Date()); formatMoneyRU(12); await hashPassword('typed consumer');
new Elysia().use(authPlugin({ secret: 'typed-consumer-fixture-only-32-bytes' })).get('/private', ({ user }) => user?.id, { auth: true });
`);
  writeFileSync(join(consumer, "tsconfig.json"), JSON.stringify({ compilerOptions: { strict: true, module: "NodeNext", moduleResolution: "NodeNext", target: "ES2022", noEmit: true, skipLibCheck: true }, include: ["consumer.ts"] }));
  execFileSync(process.execPath, ["node_modules/typescript/bin/tsc", "-p", "tsconfig.json"], { cwd: consumer, stdio: "inherit" });
  copyFileSync(join(root, "scripts/consumer-ui.mjs"), join(consumer, "ui.mjs"));
  execFileSync(process.execPath, ["ui.mjs"], { cwd: consumer, stdio: "inherit", timeout: 60_000 });
  execFileSync("npm", ["ls", "--all"], { cwd: consumer, stdio: "pipe" });
  execFileSync("npm", ["audit", "--omit=dev", "--audit-level=high"], {
    cwd: consumer,
    stdio: "pipe",
  });
  console.log("five-package registry contract: PASS");
} finally {
  rmSync(target, { force: true, recursive: true });
}
