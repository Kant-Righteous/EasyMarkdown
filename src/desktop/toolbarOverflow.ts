export const TOOLBAR_OVERFLOW_ORDER = [
  "italic",
  "underline",
  "strikethrough",
  "task-list",
  "footnote",
  "horizontal-rule",
  "table",
] as const;

export const PROTECTED_FORMAT_COMMANDS = new Set([
  "h1",
  "h2",
  "h3",
  "bold",
  "highlight",
  "unordered-list",
  "ordered-list",
  "blockquote",
  "code-block",
  "formula-block",
  "chart",
  "link",
  "image",
  "inline-code",
  "inline-formula",
]);

export function canOverflowCommand(command: string): boolean {
  return TOOLBAR_OVERFLOW_ORDER.includes(
    command as (typeof TOOLBAR_OVERFLOW_ORDER)[number],
  );
}
