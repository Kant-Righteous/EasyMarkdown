type RenderBlock = (source: string, sourceLineOffset: number) => string;
type RenderInline = (source: string) => string;

type ParsedTag = {
  name: string;
  attributes: Map<string, string | true>;
  closing: boolean;
  selfClosing: boolean;
  end: number;
};

type Placeholder = {
  token: string;
  html: string;
  block: boolean;
};

const ICON_PATHS: Record<string, string> = {
  "rectangle-list":
    "M3 5h2v2H3V5Zm4 0h14v2H7V5ZM3 11h2v2H3v-2Zm4 0h14v2H7v-2ZM3 17h2v2H3v-2Zm4 0h14v2H7v-2Z",
  "list-ol":
    "M4 4h1v4H3V6h1V4Zm-1 8h3v1H4v1h2v2H3v-3h2v-1H3Zm0 6h3v5H3v-1h2v-1H3v-1h2v-1H3v-1Zm5-13h13v2H8V5Zm0 7h13v2H8v-2Zm0 7h13v2H8v-2Z",
  "table-cells":
    "M3 4h18v16H3V4Zm2 2v3h5V6H5Zm7 0v3h7V6h-7ZM5 11v3h5v-3H5Zm7 0v3h7v-3h-7ZM5 16v2h5v-2H5Zm7 0v2h7v-2h-7Z",
  "arrow-down-from-line":
    "M11 3h2v11.2l3.6-3.6 1.4 1.4-6 6-6-6 1.4-1.4 3.6 3.6V3ZM4 20h16v2H4v-2Z",
  list: "M4 5h2v2H4V5Zm4 0h12v2H8V5ZM4 11h2v2H4v-2Zm4 0h12v2H8v-2ZM4 17h2v2H4v-2Zm4 0h12v2H8v-2Z",
  "bars-sort": "M4 5h16v2H4V5Zm0 6h11v2H4v-2Zm0 6h6v2H4v-2Z",
  "rectangle-code":
    "M3 4h18v16H3V4Zm2 2v12h14V6H5Zm5.3 3.3L7.6 12l2.7 2.7 1.4-1.4-1.3-1.3 1.3-1.3-1.4-1.4Zm3.4 0-1.4 1.4 1.3 1.3-1.3 1.3 1.4 1.4 2.7-2.7-2.7-2.7Z",
  "arrow-down-right": "M6 5h13v13h-2V8.4L6.7 18.7l-1.4-1.4L15.6 7H6V5Z",
  "arrow-down-left": "M5 5h13v2H8.4l10.3 10.3-1.4 1.4L7 8.4V18H5V5Z",
  "arrow-down-arrow-up":
    "M7 3l4 4-1.4 1.4L8 6.8V18H6V6.8L4.4 8.4 3 7l4-4Zm10 18-4-4 1.4-1.4 1.6 1.6V6h2v11.2l1.6-1.6L21 17l-4 4Z",
  maximize:
    "M4 4h6v2H7.4l3.3 3.3-1.4 1.4L6 7.4V10H4V4Zm10 0h6v6h-2V7.4l-3.3 3.3-1.4-1.4L16.6 6H14V4ZM9.3 13.3l1.4 1.4L7.4 18H10v2H4v-6h2v2.6l3.3-3.3Zm5.4 0 3.3 3.3V14h2v6h-6v-2h2.6l-3.3-3.3 1.4-1.4Z",
  brain:
    "M9 3a4 4 0 0 0-4 4v1a4 4 0 0 0-2 3.5A4.5 4.5 0 0 0 7.5 16H9V3Zm6 0a4 4 0 0 1 4 4v1a4 4 0 0 1 2 3.5A4.5 4.5 0 0 1 16.5 16H15V3ZM9 18H7.5A6.5 6.5 0 0 1 5 17.5V19a3 3 0 0 0 3 3h1v-4Zm6 0h1.5a6.5 6.5 0 0 0 2.5-.5V19a3 3 0 0 1-3 3h-1v-4Z",
  function:
    "M14 3a4 4 0 0 0-4 4v2H7v2h3v6a2 2 0 0 1-2 2H6v2h2a4 4 0 0 0 4-4v-6h4V9h-4V7a2 2 0 0 1 2-2h2V3h-2Zm2 10 2 3 2-3h2l-3 4 3 4h-2l-2-3-2 3h-2l3-4-3-4h2Z",
  database:
    "M4 6c0-2 3.6-3 8-3s8 1 8 3-3.6 3-8 3-8-1-8-3Zm0 4c1.8 1.3 4.8 2 8 2s6.2-.7 8-2v4c0 2-3.6 3-8 3s-8-1-8-3v-4Zm0 8c1.8 1.3 4.8 2 8 2s6.2-.7 8-2v1c0 2-3.6 3-8 3s-8-1-8-3v-1Z",
  code: "M8.7 6.3 3 12l5.7 5.7 1.4-1.4L5.8 12l4.3-4.3-1.4-1.4Zm6.6 0-1.4 1.4 4.3 4.3-4.3 4.3 1.4 1.4L21 12l-5.7-5.7Z",
};

const ALLOWED_STYLE_PROPERTIES = new Map<string, string>([
  ["display", "display"],
  ["gap", "gap"],
  ["alignItems", "align-items"],
  ["justifyContent", "justify-content"],
  ["width", "width"],
  ["height", "height"],
  ["borderRadius", "border-radius"],
  ["background", "background"],
  ["color", "color"],
  ["fontWeight", "font-weight"],
  ["fontSize", "font-size"],
  ["flex", "flex"],
  ["flexShrink", "flex-shrink"],
  ["margin", "margin"],
  ["lineHeight", "line-height"],
]);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function replaceLiteral(
  source: string,
  search: string,
  replacement: string,
): string {
  return source.split(search).join(replacement);
}

function dedent(value: string): string {
  const lines = value.replace(/^\s*\n/, "").replace(/\n\s*$/, "").split("\n");
  const indents = lines
    .filter((line) => line.trim())
    .map((line) => line.match(/^\s*/)?.[0].length ?? 0);
  const amount = indents.length ? Math.min(...indents) : 0;
  return lines.map((line) => line.slice(amount)).join("\n");
}

function countNewlines(value: string): number {
  return value.match(/\n/g)?.length ?? 0;
}

function dedentWithLineOffset(
  value: string,
  sourceLineOffset: number,
): { source: string; sourceLineOffset: number } {
  const leadingWhitespace = value.match(/^\s*\n/)?.[0] ?? "";
  return {
    source: dedent(value),
    sourceLineOffset: sourceLineOffset + countNewlines(leadingWhitespace),
  };
}

function safeInteger(
  value: string | true | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  if (typeof value !== "string" || !/^\{\s*\d+\s*\}$/.test(value)) {
    return fallback;
  }
  const parsed = Number.parseInt(value.replace(/[^\d]/g, ""), 10);
  return Math.min(maximum, Math.max(minimum, parsed));
}

function safeColor(value: string | true | undefined): string | null {
  if (typeof value !== "string") return null;
  if (
    /^(#[\da-f]{3,8}|[a-z]{3,20}|(?:rgb|hsl)a?\([\d\s.,%]+\))$/i.test(value)
  ) {
    return value.toLowerCase() === "#ffffff" || value.toLowerCase() === "white"
      ? "currentColor"
      : value;
  }
  return null;
}

function safeUrl(value: string | true | undefined): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

function sanitizeStyle(value: string | true | undefined): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("{{") ||
    !value.endsWith("}}")
  ) {
    return "";
  }

  const declarations: string[] = [];
  const source = value.slice(2, -2);
  const pattern =
    /([A-Za-z][A-Za-z0-9]*)\s*:\s*(?:'([^']*)'|"([^"]*)"|([\d.]+))/g;
  for (const match of source.matchAll(pattern)) {
    const property = ALLOWED_STYLE_PROPERTIES.get(match[1]);
    const cssValue = match[2] ?? match[3] ?? match[4] ?? "";
    if (
      !property ||
      !cssValue ||
      /url\s*\(|expression\s*\(|javascript:|[\u0000-\u001f]/i.test(cssValue)
    ) {
      continue;
    }
    declarations.push(`${property}:${escapeAttribute(cssValue)}`);
  }
  return declarations.join(";");
}

function findTagEnd(source: string, start: number): number {
  let quote = "";
  let braces = 0;
  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (
        character === quote ||
        (quote === "”" && character === "”") ||
        (quote === "’" && character === "’")
      ) {
        quote = "";
      } else if (character === "\\" && quote !== "”" && quote !== "’") {
        index += 1;
      }
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
    } else if (character === "“") {
      quote = "”";
    } else if (character === "‘") {
      quote = "’";
    } else if (character === "{") {
      braces += 1;
    } else if (character === "}") {
      braces = Math.max(0, braces - 1);
    } else if (character === ">" && braces === 0) {
      return index;
    }
  }
  return -1;
}

function parseAttributes(source: string): Map<string, string | true> {
  const attributes = new Map<string, string | true>();
  let index = 0;

  while (index < source.length) {
    while (/\s/.test(source[index] ?? "")) index += 1;
    const nameMatch = source.slice(index).match(/^[A-Za-z][A-Za-z0-9:-]*/);
    if (!nameMatch) {
      index += 1;
      continue;
    }
    const name = nameMatch[0];
    index += name.length;
    while (/\s/.test(source[index] ?? "")) index += 1;
    if (source[index] !== "=") {
      attributes.set(name, true);
      continue;
    }
    index += 1;
    while (/\s/.test(source[index] ?? "")) index += 1;

    const opening = source[index];
    if (opening === '"' || opening === "'" || opening === "“" || opening === "‘") {
      const closing = opening === "“" ? "”" : opening === "‘" ? "’" : opening;
      const valueStart = ++index;
      while (index < source.length && source[index] !== closing) index += 1;
      attributes.set(name, source.slice(valueStart, index));
      index += 1;
      continue;
    }
    if (opening === "{") {
      const valueStart = index;
      let depth = 0;
      let quote = "";
      while (index < source.length) {
        const character = source[index];
        if (quote) {
          if (character === quote) quote = "";
        } else if (character === '"' || character === "'") {
          quote = character;
        } else if (character === "{") {
          depth += 1;
        } else if (character === "}") {
          depth -= 1;
          if (depth === 0) {
            index += 1;
            break;
          }
        }
        index += 1;
      }
      attributes.set(name, source.slice(valueStart, index));
      continue;
    }

    const valueMatch = source.slice(index).match(/^[^\s/>]+/);
    if (valueMatch) {
      attributes.set(name, valueMatch[0]);
      index += valueMatch[0].length;
    }
  }
  return attributes;
}

function parseTagAt(source: string, start: number): ParsedTag | null {
  if (source[start] !== "<") return null;
  const end = findTagEnd(source, start + 1);
  if (end < 0) return null;
  const raw = source.slice(start + 1, end).trim();
  const closing = raw.startsWith("/");
  const normalized = closing ? raw.slice(1).trimStart() : raw;
  const nameMatch = normalized.match(/^([A-Za-z][A-Za-z0-9-]*)/);
  if (!nameMatch) return null;
  const selfClosing = !closing && /\/\s*$/.test(normalized);
  const attributeSource = normalized
    .slice(nameMatch[0].length)
    .replace(/\/\s*$/, "");
  return {
    name: nameMatch[1],
    attributes: closing ? new Map() : parseAttributes(attributeSource),
    closing,
    selfClosing,
    end: end + 1,
  };
}

function findClosingTag(
  source: string,
  start: number,
  name: string,
): { start: number; end: number } | null {
  let depth = 1;
  let cursor = start;
  while (cursor < source.length) {
    const next = source.indexOf("<", cursor);
    if (next < 0) return null;
    const tag = parseTagAt(source, next);
    if (!tag) {
      cursor = next + 1;
      continue;
    }
    if (tag.name === name) {
      if (tag.closing) depth -= 1;
      else if (!tag.selfClosing) depth += 1;
      if (depth === 0) return { start: next, end: tag.end };
    }
    cursor = tag.end;
  }
  return null;
}

function iconHtml(attributes: Map<string, string | true>): string {
  const requestedName = attributes.get("icon");
  const name =
    typeof requestedName === "string" && ICON_PATHS[requestedName]
      ? requestedName
      : "code";
  const size = safeInteger(attributes.get("size"), 20, 12, 64);
  const color = safeColor(attributes.get("color"));
  const type =
    attributes.get("iconType") === "regular" ? "regular" : "solid";
  const style = [
    `--mdx-icon-size:${size}px`,
    color ? `--mdx-icon-color:${escapeAttribute(color)}` : "",
  ]
    .filter(Boolean)
    .join(";");

  return `<span class="mdx-icon mdx-icon--${type}" aria-hidden="true"${
    style ? ` style="${style}"` : ""
  }><svg viewBox="0 0 24 24" focusable="false"><path d="${ICON_PATHS[name]}"></path></svg></span>`;
}

class LimitedMdxRenderer {
  private placeholderCounter = 0;
  private codeCounter = 0;
  private readonly protectedCode = new Map<string, string>();
  private readonly prefix: string;
  private readonly source: string;
  private readonly renderBlock: RenderBlock;
  private readonly renderInline: RenderInline;

  constructor(
    source: string,
    renderBlock: RenderBlock,
    renderInline: RenderInline,
  ) {
    this.source = source;
    this.renderBlock = renderBlock;
    this.renderInline = renderInline;
    let prefix = "EASYMDXPLACEHOLDER";
    while (source.includes(prefix)) prefix += "X";
    this.prefix = prefix;
  }

  render(): string {
    return this.renderFragment(this.source, false, 0);
  }

  private renderFragment(
    source: string,
    inline: boolean,
    sourceLineOffset: number,
  ): string {
    const protectedSource = this.protectCode(source);
    const placeholders: Placeholder[] = [];
    let transformed = this.transform(
      protectedSource,
      placeholders,
      sourceLineOffset,
    );
    for (const [token, code] of this.protectedCode) {
      transformed = replaceLiteral(transformed, token, code);
    }

    let html = inline
      ? this.renderInline(transformed)
      : this.renderBlock(transformed, sourceLineOffset);
    for (const placeholder of placeholders) {
      if (placeholder.block) {
        const paragraph = new RegExp(
          `<p(?:\\s[^>]*)?>\\s*${placeholder.token}\\s*</p>\\s*`,
          "g",
        );
        html = html.replace(paragraph, placeholder.html);
      }
      html = replaceLiteral(html, placeholder.token, placeholder.html);
    }
    return html;
  }

  private protectCode(source: string): string {
    const protect = (value: string): string => {
      const token = `${this.prefix}CODE${this.codeCounter++}END`;
      this.protectedCode.set(token, value);
      return token;
    };

    const fenced = source.replace(
      /(^|\n)([ \t]{0,3})(`{3,}|~{3,})[^\n]*\n[\s\S]*?(?:\n\2\3[^\n]*(?=\n|$)|$)/g,
      (value) => protect(value),
    );
    return fenced.replace(/(`+)(?!`)([\s\S]*?)\1(?!`)/g, (value) =>
      protect(value),
    );
  }

  private addPlaceholder(
    placeholders: Placeholder[],
    html: string,
    block: boolean,
    sourceText = "",
  ): string {
    const token = `${this.prefix}${this.placeholderCounter++}END`;
    placeholders.push({ token, html, block });
    if (!block) return token;

    const newlineCount = Math.max(2, countNewlines(sourceText));
    return `${token}${"\n".repeat(newlineCount)}`;
  }

  private transform(
    source: string,
    placeholders: Placeholder[],
    sourceLineOffset: number,
  ): string {
    let output = "";
    let cursor = 0;

    while (cursor < source.length) {
      const next = source.indexOf("<", cursor);
      if (next < 0) {
        output += source.slice(cursor);
        break;
      }
      output += source.slice(cursor, next);
      const tag = parseTagAt(source, next);
      if (!tag || tag.closing) {
        output += source[next];
        cursor = next + 1;
        continue;
      }

      const closing = tag.selfClosing
        ? null
        : findClosingTag(source, tag.end, tag.name);
      const body = closing ? source.slice(tag.end, closing.start) : "";
      const consumedEnd = closing?.end ?? tag.end;
      const consumedSource = source.slice(next, consumedEnd);
      const tagLine =
        sourceLineOffset + countNewlines(source.slice(0, next));
      const bodyStartLine =
        sourceLineOffset + countNewlines(source.slice(0, tag.end));
      const bodyFragment = dedentWithLineOffset(body, bodyStartLine);

      if (tag.name === "Icon") {
        output += this.addPlaceholder(placeholders, iconHtml(tag.attributes), false);
      } else if (tag.name === "CardGroup" && closing) {
        const columns = safeInteger(tag.attributes.get("cols"), 2, 1, 4);
        const content = this.renderFragment(
          bodyFragment.source,
          false,
          bodyFragment.sourceLineOffset,
        );
        output += this.addPlaceholder(
          placeholders,
          `<div class="mdx-card-group mdx-card-group--cols-${columns}" data-source-line="${tagLine}">${content}</div>`,
          true,
          consumedSource,
        );
      } else if (tag.name === "Card" && closing) {
        const title = tag.attributes.get("title");
        const titleHtml =
          typeof title === "string"
            ? `<h3 class="mdx-card-title">${
                tag.attributes.has("icon")
                  ? iconHtml(
                      new Map([
                        ["icon", tag.attributes.get("icon") ?? ""],
                        ["iconType", tag.attributes.get("iconType") ?? "solid"],
                      ]),
                    )
                  : ""
              }<span>${escapeHtml(title)}</span></h3>`
            : "";
        const content = this.renderFragment(
          bodyFragment.source,
          false,
          bodyFragment.sourceLineOffset,
        );
        output += this.addPlaceholder(
          placeholders,
          `<section class="mdx-card" data-source-line="${tagLine}">${titleHtml}<div class="mdx-card-body">${content}</div></section>`,
          true,
          consumedSource,
        );
      } else if (tag.name === "Tabs" && closing) {
        const content = this.renderFragment(
          bodyFragment.source,
          false,
          bodyFragment.sourceLineOffset,
        );
        output += this.addPlaceholder(
          placeholders,
          `<div class="mdx-tabs-expanded" data-source-line="${tagLine}">${content}</div>`,
          true,
          consumedSource,
        );
      } else if (tag.name === "Tab" && closing) {
        const title = tag.attributes.get("title");
        const heading =
          typeof title === "string"
            ? `<h3 class="mdx-tab-title">${escapeHtml(title)}</h3>`
            : "";
        const content = this.renderFragment(
          bodyFragment.source,
          false,
          bodyFragment.sourceLineOffset,
        );
        output += this.addPlaceholder(
          placeholders,
          `<section class="mdx-tab-section" data-source-line="${tagLine}">${heading}<div class="mdx-tab-body">${content}</div></section>`,
          true,
          consumedSource,
        );
      } else if (/^[A-Z]/.test(tag.name)) {
        if (closing) {
          const content = this.renderFragment(
            bodyFragment.source,
            false,
            bodyFragment.sourceLineOffset,
          );
          output += this.addPlaceholder(
            placeholders,
            content,
            true,
            consumedSource,
          );
        }
      } else if (tag.name.toLowerCase() === "script") {
        output += "\n".repeat(countNewlines(consumedSource));
      } else if (
        ["div", "h3", "p", "u", "img", "video"].includes(
          tag.name.toLowerCase(),
        )
      ) {
        output += this.transformHtmlTag(
          tag,
          bodyFragment,
          closing !== null,
          placeholders,
          tagLine,
          consumedSource,
        );
      } else {
        output += source.slice(next, tag.end);
        cursor = tag.end;
        continue;
      }

      cursor = consumedEnd;
    }
    return output;
  }

  private transformHtmlTag(
    tag: ParsedTag,
    body: { source: string; sourceLineOffset: number },
    hasClosingTag: boolean,
    placeholders: Placeholder[],
    sourceLine: number,
    sourceText: string,
  ): string {
    const name = tag.name.toLowerCase();
    if (name === "img") {
      const src = safeUrl(tag.attributes.get("src"));
      if (!src) return "";
      const alt = tag.attributes.get("alt");
      const width = this.safeDimension(tag.attributes.get("width"));
      const height = this.safeDimension(tag.attributes.get("height"));
      return this.addPlaceholder(
        placeholders,
        `<img class="mdx-media" data-source-line="${sourceLine}" src="${escapeAttribute(src)}"${
          typeof alt === "string" ? ` alt="${escapeAttribute(alt)}"` : ""
        }${width ? ` width="${width}"` : ""}${
          height ? ` height="${height}"` : ""
        } loading="lazy">`,
        true,
        sourceText,
      );
    }
    if (name === "video") {
      const src = safeUrl(tag.attributes.get("src"));
      if (!src) return "";
      return this.addPlaceholder(
        placeholders,
        `<video class="mdx-media" data-source-line="${sourceLine}" src="${escapeAttribute(src)}"${
          tag.attributes.has("controls") ? " controls" : ""
        } preload="metadata"></video>`,
        true,
        sourceText,
      );
    }

    const allowedContainers = new Set(["div", "h3", "p", "u"]);
    if (!allowedContainers.has(name)) {
      return hasClosingTag
        ? this.transform(body.source, placeholders, body.sourceLineOffset)
        : "";
    }

    const style = sanitizeStyle(tag.attributes.get("style"));
    const className = name === "div" ? ' class="mdx-html"' : "";
    const styleAttribute = style ? ` style="${style}"` : "";
    const inner =
      name === "u"
        ? this.renderFragment(body.source, true, body.sourceLineOffset)
        : name === "h3" || name === "p"
          ? this.renderFragment(body.source, true, body.sourceLineOffset)
          : this.renderFragment(body.source, false, body.sourceLineOffset);
    const sourceAttribute =
      name === "u" ? "" : ` data-source-line="${sourceLine}"`;
    const html = `<${name}${className}${sourceAttribute}${styleAttribute}>${inner}</${name}>`;
    return this.addPlaceholder(
      placeholders,
      html,
      name !== "u",
      sourceText,
    );
  }

  private safeDimension(value: string | true | undefined): number | null {
    if (typeof value !== "string" || !/^\d+$/.test(value)) return null;
    return Math.min(4096, Math.max(1, Number.parseInt(value, 10)));
  }
}

export function renderLimitedMdx(
  source: string,
  renderBlock: RenderBlock,
  renderInline: RenderInline,
): string {
  return new LimitedMdxRenderer(source, renderBlock, renderInline).render();
}
