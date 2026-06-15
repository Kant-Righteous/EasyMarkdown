import MarkdownIt from "markdown-it";
import { footnote } from "@mdit/plugin-footnote";
import { katex } from "@mdit/plugin-katex";
import { mark } from "@mdit/plugin-mark";
import { tasklist } from "@mdit/plugin-tasklist";
import { renderLimitedMdx } from "./limitedMdx.ts";
import { renderMermaidDiagrams } from "./mermaid.ts";

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
    disabled: true,
    label: true,
  });
  markdown.use(mark);
  addSourceLineAnchors(markdown);
  addMermaidFence(markdown);

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
