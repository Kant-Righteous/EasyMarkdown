import test from "node:test";
import assert from "node:assert/strict";
import {
  getVisibleOutlineItems,
  parseOutline,
} from "../src/outline.ts";

test("parses ATX headings from H1 through H4", () => {
  const items = parseOutline(`
# Title
## Section
### Detail ###
#### Note
##### Ignored
`);

  assert.deepEqual(
    items.map(({ level, text, line }) => ({ level, text, line })),
    [
      { level: 1, text: "Title", line: 2 },
      { level: 2, text: "Section", line: 3 },
      { level: 3, text: "Detail", line: 4 },
      { level: 4, text: "Note", line: 5 },
    ],
  );
});

test("ignores headings inside fenced code blocks", () => {
  const items = parseOutline(`
# Visible
\`\`\`md
## Hidden
\`\`\`
~~~text
### Also hidden
~~~
## Visible too
`);

  assert.deepEqual(
    items.map((item) => item.text),
    ["Visible", "Visible too"],
  );
});

test("marks headings with descendants and hides collapsed branches", () => {
  const items = parseOutline(`
# Root
## Child
### Grandchild
## Sibling
# Second root
`);

  assert.equal(items[0].hasChildren, true);
  assert.equal(items[1].hasChildren, true);
  assert.equal(items[2].hasChildren, false);
  assert.deepEqual(
    getVisibleOutlineItems(items, new Set([items[1].id])).map(
      (item) => item.text,
    ),
    ["Root", "Child", "Sibling", "Second root"],
  );
  assert.deepEqual(
    getVisibleOutlineItems(items, new Set([items[0].id])).map(
      (item) => item.text,
    ),
    ["Root", "Second root"],
  );
});

test("keeps exact editor offsets for CRLF documents", () => {
  const items = parseOutline("# A\r\n## B\r\nText");

  assert.equal(items[0].offset, 0);
  assert.equal(items[1].offset, 5);
});
