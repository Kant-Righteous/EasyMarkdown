import test from "node:test";
import assert from "node:assert/strict";
import { copyBlockSource } from "../src/shared/markdown/previewBlockCopy.ts";

test("reports success after writing the block source", async () => {
  let copied = "";

  const result = await copyBlockSource("const value = 1;", async (source) => {
    copied = source;
  });

  assert.equal(result, true);
  assert.equal(copied, "const value = 1;");
});

test("reports failure when clipboard writing is rejected", async () => {
  const result = await copyBlockSource("source", async () => {
    throw new Error("clipboard unavailable");
  });

  assert.equal(result, false);
});
