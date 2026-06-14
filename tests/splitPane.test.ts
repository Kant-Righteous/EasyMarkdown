import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_SPLIT_RATIO,
  clampSplitRatio,
  getSplitRatioFromPointer,
} from "../src/splitPane.ts";

test("split ratio defaults to half and stays between twenty and eighty percent", () => {
  assert.equal(DEFAULT_SPLIT_RATIO, 50);
  assert.equal(clampSplitRatio(5), 20);
  assert.equal(clampSplitRatio(62.4), 62.4);
  assert.equal(clampSplitRatio(95), 80);
});

test("split ratio follows pointer position inside workspace", () => {
  assert.equal(getSplitRatioFromPointer(600, 100, 1000), 50);
  assert.equal(getSplitRatioFromPointer(150, 100, 1000), 20);
  assert.equal(getSplitRatioFromPointer(1050, 100, 1000), 80);
});
