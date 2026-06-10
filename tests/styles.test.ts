import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const styles = await readFile(
  new URL("../src/style.css", import.meta.url),
  "utf8",
);

test("预览区强调文本明确显示为斜体", () => {
  assert.match(
    styles,
    /#preview em\s*\{[^}]*font-style:\s*italic;[^}]*font-synthesis:\s*style;/s,
  );
});

test("加粗和斜体按钮内容水平居中", () => {
  assert.match(
    styles,
    /\.format-group button\[data-command="bold"\],[\s\S]*?\.format-group button\[data-command="italic"\][\s\S]*?\{[^}]*justify-content:\s*center;/,
  );
});

test("预览代码块和引用随可用宽度收缩", () => {
  assert.match(
    styles,
    /#preview > \*\s*\{[^}]*width:\s*min\(100%,\s*74ch\);[^}]*max-width:\s*100%;/s,
  );
  assert.match(
    styles,
    /#preview pre\s*\{[^}]*white-space:\s*pre-wrap;[^}]*overflow-wrap:\s*anywhere;/s,
  );
  assert.match(
    styles,
    /#preview blockquote\s*\{[^}]*max-width:\s*100%;/s,
  );
});
