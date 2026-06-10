import MarkdownIt from "markdown-it";

export function createMarkdownRenderer(): MarkdownIt {
  const markdown = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
  });

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
  return renderer.render(markdown);
}
