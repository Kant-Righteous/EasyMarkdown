import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../src/toolbar.ts", import.meta.url),
  "utf8",
);

test("点击格式收纳入口不会被文档级关闭逻辑立即关闭", () => {
  assert.match(
    source,
    /\.closest\(\s*"\.dropdown, \.format-overflow",?\s*\)/,
  );
});
