import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const expectedVersion = "1.1.0";

test("application and installer versions are consistent", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  );
  const packageLock = JSON.parse(
    await readFile(new URL("../package-lock.json", import.meta.url), "utf8"),
  );
  const tauriConfig = JSON.parse(
    await readFile(
      new URL("../src-tauri/tauri.conf.json", import.meta.url),
      "utf8",
    ),
  );
  const cargoToml = await readFile(
    new URL("../src-tauri/Cargo.toml", import.meta.url),
    "utf8",
  );
  const cargoLock = await readFile(
    new URL("../src-tauri/Cargo.lock", import.meta.url),
    "utf8",
  );

  assert.equal(packageJson.version, expectedVersion);
  assert.equal(packageLock.version, expectedVersion);
  assert.equal(packageLock.packages[""].version, expectedVersion);
  assert.equal(tauriConfig.version, expectedVersion);
  assert.match(
    cargoToml,
    new RegExp(
      `^\\[package\\][\\s\\S]*?^version = "${expectedVersion.replaceAll(".", "\\.")}"$`,
      "m",
    ),
  );
  assert.match(
    cargoLock,
    new RegExp(
      `\\[\\[package\\]\\]\\s+name = "easymarkdown"\\s+version = "${expectedVersion.replaceAll(".", "\\.")}"`,
    ),
  );
});
