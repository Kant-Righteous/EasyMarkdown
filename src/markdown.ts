import MarkdownIt from "markdown-it";
import { renderLimitedMdx } from "./limitedMdx.ts";

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

export function createMarkdownRenderer(): MarkdownIt {
  const markdown = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
  });
  addSourceLineAnchors(markdown);

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
    tokens[index].attrSet("data-external-link", "true");
    tokens[index].attrSet("rel", "noopener noreferrer");
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
