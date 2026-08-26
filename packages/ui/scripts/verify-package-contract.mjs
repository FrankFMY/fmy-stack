import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const target = mkdtempSync(join(tmpdir(), "frankfmy-ui-consumer-"));

try {
  const output = execFileSync("npm", ["pack", "--silent", "--pack-destination", target], {
    cwd: root,
    encoding: "utf8",
  }).trim();
  const tarball = join(target, output.split("\n").at(-1));
  writeFileSync(join(target, "package.json"), '{"name":"frankfmy-ui-consumer","private":true,"type":"module"}\n');
  execFileSync("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", tarball], {
    cwd: target,
    stdio: "pipe",
  });
  writeFileSync(
    join(target, "check.mjs"),
    [
      'import { readFile } from "node:fs/promises";',
      'const rootExport = import.meta.resolve("@frankfmy/ui");',
      'const stylesExport = import.meta.resolve("@frankfmy/ui/styles.css");',
      'const rootSource = await readFile(new URL(rootExport), "utf8");',
      'const css = await readFile(new URL(stylesExport), "utf8");',
      'if (!rootSource.includes(".svelte") || !css.includes("@source")) process.exit(1);',
      'console.log("isolated UI package exports: PASS");',
      "",
    ].join("\n"),
  );
  execFileSync(process.execPath, [join(target, "check.mjs")], { cwd: target, stdio: "inherit" });
} finally {
  rmSync(target, { force: true, recursive: true });
}
