import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html, styles] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../src/style.css", import.meta.url), "utf8"),
]);

test("状态栏包含共享缩放控件", () => {
  assert.match(html, /<input[^>]*id="zoom-value"/);
  assert.match(html, /inputmode="numeric"/);
  assert.match(html, /data-zoom-action="decrease"/);
  assert.match(html, /data-zoom-action="increase"/);
  assert.match(html, /data-zoom-action="reset"/);
});

test("编辑区和预览区使用同一个缩放变量", () => {
  assert.match(styles, /#editor\s*\{[^}]*font-size:\s*calc\(15px \* var\(--content-zoom\)\);/s);
  assert.match(styles, /#preview\s*\{[^}]*font-size:\s*calc\(15px \* var\(--content-zoom\)\);/s);
});
