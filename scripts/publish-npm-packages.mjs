import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const releaseTag = process.env.RELEASE_TAG;
if (
  process.env.GITHUB_ACTIONS !== "true" ||
  !process.env.ACTIONS_ID_TOKEN_REQUEST_URL ||
  process.env.GITHUB_REF_TYPE !== "tag" ||
  releaseTag !== "v1.1.2" ||
  process.env.GITHUB_REF_NAME !== releaseTag
) {
  throw new Error("npm publication is restricted to the v1.1.2 GitHub release tag with OIDC");
}
const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const tagCommit = execFileSync("git", ["rev-parse", `${releaseTag}^{commit}`], { cwd: root, encoding: "utf8" }).trim();
if (!process.env.GITHUB_SHA || head !== process.env.GITHUB_SHA || tagCommit !== head) {
  throw new Error("release tag does not resolve to the event commit");
}

const packages = [
  ["packages/core", "@frankfmy/core"],
  ["packages/validation", "@frankfmy/validation"],
  ["packages/db-utils", "@frankfmy/db-utils"],
  ["packages/elysia-kit", "@frankfmy/elysia-kit"],
  ["packages/ui", "@frankfmy/ui"],
];
const target = mkdtempSync(join(tmpdir(), "fmy-stack-publish-"));
const sleep = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));

async function registryVersion(name, version) {
  const response = await fetch(
    `https://registry.npmjs.org/${encodeURIComponent(name)}/${encodeURIComponent(version)}`,
    { headers: { accept: "application/json" } },
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`${name}@${version} registry HTTP ${response.status}`);
  return response.json();
}

try {
  for (const [directory, expectedName] of packages) {
    const cwd = join(root, directory);
    const output = execFileSync("npm", ["pack", "--json", "--pack-destination", target], {
      cwd,
      encoding: "utf8",
    });
    const parsed = JSON.parse(output);
    const packed = Array.isArray(parsed) ? parsed[0] : Object.values(parsed)[0];
    if (packed.name !== expectedName || packed.version !== "1.1.2") {
      throw new Error(`${expectedName} package identity mismatch`);
    }
    const tarball = join(target, packed.filename);
    const existing = await registryVersion(expectedName, packed.version);
    if (existing) {
      if (existing.dist?.integrity !== packed.integrity) {
        throw new Error(`${expectedName}@${packed.version} already exists with different integrity`);
      }
      console.log(`${expectedName}@${packed.version}: existing registry integrity verified`);
      continue;
    }
    execFileSync("npm", ["publish", tarball, "--access", "public", "--provenance"], {
      cwd: root,
      stdio: "inherit",
    });
    let verified = false;
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const published = await registryVersion(expectedName, packed.version);
      if (published?.dist?.integrity === packed.integrity) {
        verified = true;
        break;
      }
      await sleep(2_000);
    }
    if (!verified) throw new Error(`${expectedName}@${packed.version} registry integrity readback failed`);
    console.log(`${expectedName}@${packed.version}: published integrity verified`);
  }
} finally {
  rmSync(target, { force: true, recursive: true });
}
