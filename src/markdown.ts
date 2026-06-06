import MarkdownIt from "markdown-it";

export function createMarkdownRenderer(): MarkdownIt {
  return new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
  });
}

const renderer = createMarkdownRenderer();

export function renderMarkdown(markdown: string): string {
  return renderer.render(markdown);
}
