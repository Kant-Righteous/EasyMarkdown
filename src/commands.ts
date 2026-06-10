import {
  getSelection,
  insertAtCursor,
  replaceSelection,
  wrapSelection,
} from "./editor";
import { t } from "./i18n";

function defaultItems(): string {
  return [t("command.item1"), t("command.item2"), t("command.item3")].join("\n");
}

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
  const value = selection.text || defaultItems();
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
  prefixLines(`${"#".repeat(level)} `, t("command.heading"));
}

export function bold(): void {
  wrapSelection("**", "**", t("command.bold"));
}

export function italic(): void {
  wrapSelection("*", "*", t("command.italic"));
}

export function unorderedList(): void {
  prefixLines("- ", defaultItems());
}

export function orderedList(): void {
  numberedLines();
}

export function blockquote(): void {
  prefixLines("> ", t("command.quote"));
}

export function codeBlock(): void {
  wrapSelection("```text\n", "\n```", t("command.code"));
}

export function link(): void {
  wrapSelection("[", "](https://example.com)", t("command.link"));
}

export function table(): void {
  insertBlock(
    `| ${t("command.column1")} | ${t("command.column2")} | ${t("command.column3")} |\n| --- | --- | --- |\n| ${t("command.content1")} | ${t("command.content2")} | ${t("command.content3")} |`,
  );
}

export function horizontalRule(): void {
  insertBlock("---");
}
