import test from "node:test";
import assert from "node:assert/strict";
import {
  getOutlineNavigationSurface,
  getPreviewHeadingSelector,
} from "../src/outlineNavigation.ts";

test("preview and split modes navigate using the preview surface", () => {
  assert.equal(getOutlineNavigationSurface("preview"), "preview");
  assert.equal(getOutlineNavigationSurface("split"), "preview");
  assert.equal(getOutlineNavigationSurface("edit"), "editor");
});

test("preview heading selector uses the exact zero-based source line", () => {
  assert.equal(
    getPreviewHeadingSelector({ level: 2, line: 18 }),
    '#preview h2[data-source-line="17"]',
  );
});
