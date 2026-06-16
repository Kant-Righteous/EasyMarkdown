import test from "node:test";
import assert from "node:assert/strict";
import {
  isSupportedDroppedFile,
  selectDroppedFile,
} from "../src/desktop/fileDrop.ts";

test("file drop accepts Markdown and text files case-insensitively", () => {
  assert.equal(isSupportedDroppedFile("C:\\docs\\note.md"), true);
  assert.equal(isSupportedDroppedFile("C:\\docs\\note.MARKDOWN"), true);
  assert.equal(isSupportedDroppedFile("C:\\docs\\note.Txt"), true);
  assert.equal(isSupportedDroppedFile("C:\\docs\\image.png"), false);
  assert.equal(isSupportedDroppedFile("C:\\docs\\folder.md\\image.png"), false);
});

test("file drop selects the first supported file", () => {
  assert.equal(
    selectDroppedFile([
      "C:\\docs\\image.png",
      "C:\\docs\\first.md",
      "C:\\docs\\second.txt",
    ]),
    "C:\\docs\\first.md",
  );
  assert.equal(selectDroppedFile(["C:\\docs\\image.png"]), null);
});
