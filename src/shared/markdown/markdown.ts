import MarkdownIt from "markdown-it";
import { footnote } from "@mdit/plugin-footnote";
import { katex } from "@mdit/plugin-katex";
import { mark } from "@mdit/plugin-mark";
import { tasklist } from "@mdit/plugin-tasklist";
import { renderLimitedMdx } from "./limitedMdx.ts";
import { renderMermaidDiagrams } from "./mermaid.ts";

function quoteCopySource(source: string, start: number, end: number): string {
  return source
    .split(/\r\n|\n|\r/)
    .slice(start, end)
    .map((line) => line.replace(/^\s{0,3}>\s?/, ""))
    .join("\n")
    .replace(/\n+$/, "");
}

function copyAttributes(markdown: MarkdownIt, source: string): string {
  return `class="preview-copy-block" data-copy-source="${markdown.utils.escapeHtml(source)}"`;
}

function addSourceLineAnchors(markdown: MarkdownIt): void {
  markdown.core.ruler.after("block", "source_line_anchors", (state) => {
    const offset =
      typeof state.env?.sourceLineOffset === "number"
        ? state.env.sourceLineOffset
        : 0;
    for (const token of state.tokens) {
      if (
        !token.map ||
        (token.nesting !== 1 &&
          token.type !== "fence" &&
          token.type !== "code_block" &&
          token.type !== "hr")
      ) {
        continue;
      }
      const sourceLine = String(token.map[0] + offset);
      if (token.type === "fence" || token.type === "code_block") {
        token.meta = { ...token.meta, sourceLine };
      } else {
        token.attrSet("data-source-line", sourceLine);
      }
    }
  });

  for (const ruleName of ["fence", "code_block"] as const) {
    const defaultRule = markdown.renderer.rules[ruleName];
    if (!defaultRule) continue;
    markdown.renderer.rules[ruleName] = (
      tokens,
      index,
      options,
      environment,
      renderer,
    ) => {
      const html = defaultRule(
        tokens,
        index,
        options,
        environment,
        renderer,
      );
      const sourceLine = tokens[index].meta?.sourceLine;
      return typeof sourceLine !== "string"
        ? html
        : html.replace(
            /^<pre/,
            `<pre data-source-line="${sourceLine}"`,
          );
    };
  }
}

function addMermaidFence(markdown: MarkdownIt): void {
  const defaultFence = markdown.renderer.rules.fence;
  if (!defaultFence) return;

  markdown.renderer.rules.fence = (
    tokens,
    index,
    options,
    environment,
    renderer,
  ) => {
    const token = tokens[index];
    const language = token.info.trim().split(/\s+/, 1)[0]?.toLowerCase();
    if (language !== "mermaid") {
      return defaultFence(tokens, index, options, environment, renderer);
    }

    const sourceLine = token.meta?.sourceLine;
    const sourceAttribute =
      typeof sourceLine === "string"
        ? ` data-source-line="${sourceLine}"`
        : "";
    return `<div class="mermaid-diagram" data-mermaid-state="pending"${sourceAttribute}><pre class="mermaid-source">${markdown.utils.escapeHtml(token.content)}</pre></div>\n`;
  };
}

function addCopyableBlocks(markdown: MarkdownIt): void {
  markdown.core.ruler.after("source_line_anchors", "copyable_blocks", (state) => {
    for (const token of state.tokens) {
      if (!token.map) continue;

      if (token.type === "blockquote_open") {
        token.attrJoin("class", "preview-copy-block");
        token.attrSet(
          "data-copy-source",
          quoteCopySource(state.src, token.map[0], token.map[1]),
        );
      } else if (
        token.type === "fence" ||
        token.type === "code_block" ||
        token.type === "math_block"
      ) {
        token.meta = { ...token.meta, copySource: token.content };
      }
    }
  });

  for (const ruleName of ["fence", "code_block"] as const) {
    const defaultRule = markdown.renderer.rules[ruleName];
    if (!defaultRule) continue;

    markdown.renderer.rules[ruleName] = (
      tokens,
      index,
      options,
      environment,
      renderer,
    ) => {
      const html = defaultRule(
        tokens,
        index,
        options,
        environment,
        renderer,
      );
      const source = tokens[index].meta?.copySource;
      if (typeof source !== "string") return html;

      if (html.startsWith('<div class="mermaid-diagram"')) {
        return html.replace(
          '<div class="mermaid-diagram"',
          `<div class="mermaid-diagram preview-copy-block" data-copy-source="${markdown.utils.escapeHtml(source)}"`,
        );
      }
      return html.replace(
        /^<pre/,
        `<pre ${copyAttributes(markdown, source)}`,
      );
    };
  }

  const defaultMathBlock = markdown.renderer.rules.math_block;
  if (defaultMathBlock) {
    markdown.renderer.rules.math_block = (
      tokens,
      index,
      options,
      environment,
      renderer,
    ) => {
      const html = defaultMathBlock(
        tokens,
        index,
        options,
        environment,
        renderer,
      );
      const source = tokens[index].meta?.copySource;
      if (typeof source !== "string") return html;

      return html.replace(
        /^<p class=['"]katex-block['"]>/,
        `<p class="katex-block preview-copy-block" data-copy-source="${markdown.utils.escapeHtml(source)}">`,
      );
    };
  }
}

export function createMarkdownRenderer(): MarkdownIt {
  const markdown = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
  });
  markdown.use(katex, {
    delimiters: "dollars",
    throwOnError: false,
    strict: "ignore",
  });
  markdown.use(footnote);
  markdown.use(tasklist, {
    disabled: false,
    label: true,
  });
  markdown.use(mark);
  addSourceLineAnchors(markdown);
  addMermaidFence(markdown);
  addCopyableBlocks(markdown);

  const defaultLinkOpen =
    markdown.renderer.rules.link_open ??
    ((tokens, index, options, _environment, renderer) =>
      renderer.renderToken(tokens, index, options));

  markdown.renderer.rules.link_open = (
    tokens,
    index,
    options,
    environment,
    renderer,
  ) => {
    const href = tokens[index].attrGet("href") ?? "";
    if (!href.startsWith("#")) {
      tokens[index].attrSet("data-external-link", "true");
      tokens[index].attrSet("rel", "noopener noreferrer");
    }
    return defaultLinkOpen(tokens, index, options, environment, renderer);
  };

  return markdown;
}

const renderer = createMarkdownRenderer();

export function renderMarkdown(markdown: string): string {
  return renderLimitedMdx(
    markdown,
    (source, sourceLineOffset) =>
      renderer.render(source, { sourceLineOffset }),
    (source) => renderer.renderInline(source),
  );
}

export async function renderMarkdownWithMermaid(
  markdown: string,
): Promise<string> {
  const container = document.createElement("div");
  container.innerHTML = renderMarkdown(markdown);
  await renderMermaidDiagrams(container);
  return container.innerHTML;
}
