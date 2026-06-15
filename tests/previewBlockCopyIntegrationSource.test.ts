import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [mainSource, exportSource, copySource] = await Promise.all([
  readFile(new URL("../src/main.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/exportPdf.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/previewBlockCopy.ts", import.meta.url), "utf8"),
]);

test("live preview binds and decorates block copy controls", () => {
  assert.match(mainSource, /bindPreviewBlockCopy\(/);
  assert.match(mainSource, /decoratePreviewCopyBlocks\(preview\)/);
  assert.match(copySource, /preview-copy-button/);
  assert.match(copySource, /1500/);
  assert.match(copySource, /block\.prepend\(button\)/);
});

test("PDF export does not decorate copy controls", () => {
  assert.doesNotMatch(exportSource, /decoratePreviewCopyBlocks/);
  assert.doesNotMatch(exportSource, /bindPreviewBlockCopy/);
});
