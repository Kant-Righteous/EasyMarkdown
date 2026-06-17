import {
  getContent,
  getSelection,
  insertAtCursor,
  replaceSelection,
  wrapSelection,
} from "./editor";
import {
  footnoteTemplate,
  headingText,
  nextFootnoteIndex,
  orderedListText,
  prefixedLines,
  taskListText,
} from "./formatting";
import { t } from "./i18n/i18n";

function defaultItems(): string {
  return [t("command.item1"), t("command.item2"), t("command.item3")].join("\n");
}

function prefixLines(prefix: string, placeholder: string): void {
  const selection = getSelection();
  replaceSelection(prefixedLines(selection.text, prefix, placeholder));
}

function numberedLines(): void {
  const selection = getSelection();
  replaceSelection(orderedListText(selection.text, defaultItems()));
}

function insertBlock(content: string): void {
  const selection = getSelection();
  const leadingNewline = selection.start > 0 ? "\n" : "";
  insertAtCursor(`${leadingNewline}${content}\n`);
}

export function heading(level: 1 | 2 | 3 | 4): void {
  const selection = getSelection();
  replaceSelection(headingText(selection.text, level, t("command.heading")));
}

export function bold(): void {
  wrapSelection("**", "**", t("command.bold"));
}

export function italic(): void {
  wrapSelection("*", "*", t("command.italic"));
}

export function underline(): void {
  wrapSelection("<u>", "</u>", t("command.underline"));
}

export function strikethrough(): void {
  wrapSelection("~~", "~~", t("command.strikethrough"));
}

export function highlight(): void {
  wrapSelection("==", "==", t("command.highlight"));
}

export function unorderedList(): void {
  prefixLines("- ", defaultItems());
}

export function orderedList(): void {
  numberedLines();
}

export function taskList(): void {
  const selection = getSelection();
  replaceSelection(taskListText(selection.text, defaultItems()));
}

export function blockquote(): void {
  prefixLines("> ", t("command.quote"));
}

export function codeBlock(): void {
  wrapSelection("```text\n", "\n```", t("command.code"));
}

export function formulaBlock(): void {
  wrapSelection("$$\n", "\n$$", t("command.formula"));
}

export function chart(): void {
  wrapSelection(
    "```mermaid\n",
    "\n```",
    `flowchart TD\n  A[${t("command.chartStart")}] --> B[${t("command.chartEnd")}]`,
  );
}

export function link(): void {
  wrapSelection("[", "](https://example.com)", t("command.link"));
}

export function image(): void {
  wrapSelection("![", "](./image.png)", t("command.image"));
}

export function table(): void {
  insertBlock(
    `| ${t("command.column1")} | ${t("command.column2")} | ${t("command.column3")} |\n| --- | --- | --- |\n| ${t("command.content1")} | ${t("command.content2")} | ${t("command.content3")} |`,
  );
}

export function horizontalRule(): void {
  insertBlock("---");
}

export function inlineCode(): void {
  wrapSelection("`", "`", t("command.inlineCode"));
}

export function inlineFormula(): void {
  wrapSelection("$", "$", t("command.inlineFormula"));
}

export function footnote(): void {
  const index = nextFootnoteIndex(getContent());
  insertBlock(footnoteTemplate(index, t("command.footnote")));
}
