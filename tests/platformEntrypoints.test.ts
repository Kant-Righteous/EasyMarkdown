import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [
  packageJson,
  viteConfig,
  tauriConfig,
  windowsConfig,
  androidConfig,
  iosConfig,
  desktopHtml,
  desktopMain,
  mobileHtml,
  mobileMain,
] = await Promise.all([
  readFile(new URL("../package.json", import.meta.url), "utf8"),
  readFile(new URL("../vite.config.ts", import.meta.url), "utf8"),
  readFile(new URL("../src-tauri/tauri.conf.json", import.meta.url), "utf8"),
  readFile(new URL("../src-tauri/tauri.windows.conf.json", import.meta.url), "utf8"),
  readFile(new URL("../src-tauri/tauri.android.conf.json", import.meta.url), "utf8"),
  readFile(new URL("../src-tauri/tauri.ios.conf.json", import.meta.url), "utf8"),
  readFile(new URL("../src/desktop/index.html", import.meta.url), "utf8"),
  readFile(new URL("../src/desktop/main.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/mobile/index.html", import.meta.url), "utf8"),
  readFile(new URL("../src/mobile/main.ts", import.meta.url), "utf8"),
]);

test("package scripts expose desktop and mobile Vite builds", () => {
  assert.match(packageJson, /"dev:desktop":\s*"vite --mode desktop"/);
  assert.match(packageJson, /"dev:mobile":\s*"vite --mode mobile"/);
  assert.match(packageJson, /"build:desktop":\s*"tsc && vite build --mode desktop"/);
  assert.match(packageJson, /"build:mobile":\s*"tsc && vite build --mode mobile"/);
});

test("Vite modes select separate roots and output directories", () => {
  assert.match(viteConfig, /desktop:\s*"src\/desktop"/);
  assert.match(viteConfig, /mobile:\s*"src\/mobile"/);
  assert.match(viteConfig, /desktop:\s*"\.\.\/\.\.\/dist-desktop"/);
  assert.match(viteConfig, /mobile:\s*"\.\.\/\.\.\/dist-mobile"/);
});

test("Tauri platform configs select the correct frontend resources", () => {
  assert.match(tauriConfig, /"frontendDist":\s*"\.\.\/dist-desktop"/);
  assert.match(windowsConfig, /"beforeBuildCommand":\s*"npm run build:desktop"/);
  assert.match(windowsConfig, /"frontendDist":\s*"\.\.\/dist-desktop"/);
  assert.match(androidConfig, /"beforeBuildCommand":\s*"npm run build:mobile"/);
  assert.match(androidConfig, /"frontendDist":\s*"\.\.\/dist-mobile"/);
  assert.match(iosConfig, /"beforeBuildCommand":\s*"npm run build:mobile"/);
  assert.match(iosConfig, /"frontendDist":\s*"\.\.\/dist-mobile"/);
});

test("desktop and mobile entries do not import each other", () => {
  assert.match(desktopHtml, /src="\/main\.ts"/);
  assert.match(mobileHtml, /src="\/main\.ts"/);
  assert.doesNotMatch(desktopMain, /\.\.\/mobile|\/mobile\//);
  assert.doesNotMatch(mobileMain, /\.\.\/desktop|\/desktop\//);
  assert.match(desktopMain, /\.\.\/shared\//);
  assert.match(mobileMain, /\.\.\/shared\//);
});
