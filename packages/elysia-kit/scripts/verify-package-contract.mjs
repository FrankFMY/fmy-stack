import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const target = mkdtempSync(join(tmpdir(), "frankfmy-elysia-kit-consumer-"));

try {
  const output = execFileSync("npm", ["pack", "--silent", "--pack-destination", target], {
    cwd: root,
    encoding: "utf8",
  }).trim();
  const tarball = join(target, output.split("\n").at(-1));
  writeFileSync(join(target, "package.json"), '{"name":"frankfmy-elysia-kit-consumer","private":true,"type":"module"}\n');
  execFileSync("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", tarball], {
    cwd: target,
    stdio: "pipe",
  });
  writeFileSync(
    join(target, "check.mjs"),
    'import("@frankfmy/elysia-kit").then((module) => { if (typeof module.rateLimiter !== "function") process.exit(1); });\n',
  );
  execFileSync(process.execPath, [join(target, "check.mjs")], {
    cwd: target,
    stdio: "inherit",
    timeout: 3_000,
  });
  writeFileSync(
    join(target, "consumer.ts"),
    [
      'import { Elysia } from "elysia";',
      'import { authPlugin, jwtMiddleware } from "@frankfmy/elysia-kit";',
      'new Elysia().use(authPlugin({ secret: "01234567890123456789012345678901" })).get("/profile", ({ user, token, jwt }) => ({ user, token, jwt }));',
      'new Elysia().use(authPlugin({ secret: "01234567890123456789012345678901" })).use(jwtMiddleware).get("/required", ({ user }) => user);',
      "",
    ].join("\n"),
  );
  writeFileSync(
    join(target, "tsconfig.json"),
    `${JSON.stringify({ compilerOptions: { module: "NodeNext", moduleResolution: "NodeNext", noEmit: true, skipLibCheck: true, strict: true, target: "ES2022" }, include: ["consumer.ts"] }, null, 2)}\n`,
  );
  execFileSync(process.execPath, [join(root, "node_modules/typescript/bin/tsc"), "-p", "tsconfig.json"], {
    cwd: target,
    stdio: "inherit",
  });
  console.log("isolated Elysia TypeScript context: PASS");
  console.log("isolated Elysia package import/exit: PASS");
} finally {
  rmSync(target, { force: true, recursive: true });
}
