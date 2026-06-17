function valueOrPlaceholder(value: string, placeholder: string): string {
  return value || placeholder;
}

export function prefixedLines(
  value: string,
  prefix: string,
  placeholder: string,
): string {
  return valueOrPlaceholder(value, placeholder)
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
}

export function orderedListText(
  value: string,
  placeholder: string,
): string {
  return valueOrPlaceholder(value, placeholder)
    .split("\n")
    .map((line, index) => `${index + 1}. ${line}`)
    .join("\n");
}

export function taskListText(
  value: string,
  placeholder: string,
): string {
  return prefixedLines(value, "- [ ] ", placeholder);
}

export function headingText(
  value: string,
  level: 1 | 2 | 3 | 4,
  placeholder: string,
): string {
  const prefix = `${"#".repeat(level)} `;
  return valueOrPlaceholder(value, placeholder)
    .split("\n")
    .map((line) => `${prefix}${line.replace(/^\s{0,3}#{1,6}[ \t]+/, "")}`)
    .join("\n");
}

export function wrappedText(
  value: string,
  before: string,
  after: string,
  placeholder: string,
): string {
  return `${before}${valueOrPlaceholder(value, placeholder)}${after}`;
}

export function nextFootnoteIndex(content: string): number {
  let highest = 0;
  for (const match of content.matchAll(/\[\^(\d+)\]/g)) {
    highest = Math.max(highest, Number(match[1]));
  }
  return highest + 1;
}

export function footnoteTemplate(index: number, placeholder: string): string {
  return `[^${index}]\n\n[^${index}]: ${placeholder}`;
}
