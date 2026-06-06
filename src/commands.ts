import {
  getSelection,
  insertAtCursor,
  replaceSelection,
  wrapSelection,
} from "./editor";

function prefixLines(prefix: string, placeholder: string): void {
  const selection = getSelection();
  const value = selection.text || placeholder;
  replaceSelection(
    value
      .split("\n")
      .map((line) => `${prefix}${line}`)
      .join("\n"),
  );
}

function numberedLines(): void {
  const selection = getSelection();
  const value = selection.text || "第一项\n第二项\n第三项";
  replaceSelection(
    value
      .split("\n")
      .map((line, index) => `${index + 1}. ${line}`)
      .join("\n"),
  );
}

function insertBlock(content: string): void {
  const selection = getSelection();
  const leadingNewline = selection.start > 0 ? "\n" : "";
  insertAtCursor(`${leadingNewline}${content}\n`);
}

export function heading(level: 1 | 2 | 3): void {
  prefixLines(`${"#".repeat(level)} `, "标题");
}

export function bold(): void {
  wrapSelection("**", "**", "加粗文字");
}

export function italic(): void {
  wrapSelection("*", "*", "斜体文字");
}

export function unorderedList(): void {
  prefixLines("- ", "第一项\n第二项\n第三项");
}

export function orderedList(): void {
  numberedLines();
}

export function blockquote(): void {
  prefixLines("> ", "引用内容");
}

export function codeBlock(): void {
  wrapSelection("```text\n", "\n```", "代码内容");
}

export function link(): void {
  wrapSelection("[", "](https://example.com)", "链接文字");
}

export function table(): void {
  insertBlock(
    "| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容1 | 内容2 | 内容3 |",
  );
}

export function horizontalRule(): void {
  insertBlock("---");
}
