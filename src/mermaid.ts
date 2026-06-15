import { t } from "./i18n.ts";

type MermaidApi = (typeof import("mermaid"))["default"];

let mermaidLoader: Promise<MermaidApi> | null = null;
let diagramSequence = 0;

function loadMermaid(): Promise<MermaidApi> {
  mermaidLoader ??= import("mermaid").then(({ default: mermaid }) => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      htmlLabels: false,
      suppressErrorRendering: true,
    });
    return mermaid;
  });
  return mermaidLoader;
}

function showMermaidError(diagram: HTMLElement): void {
  diagram.dataset.mermaidState = "error";
  if (diagram.querySelector(".mermaid-error")) return;

  const message = document.createElement("p");
  message.className = "mermaid-error";
  message.textContent = t("preview.mermaidError");
  diagram.append(message);
}

export async function renderMermaidDiagrams(
  root: HTMLElement,
): Promise<void> {
  const diagrams = Array.from(
    root.querySelectorAll<HTMLElement>(
      '.mermaid-diagram[data-mermaid-state="pending"]',
    ),
  );
  if (diagrams.length === 0) return;

  let mermaid: MermaidApi;
  try {
    mermaid = await loadMermaid();
  } catch {
    diagrams.forEach(showMermaidError);
    return;
  }

  for (const diagram of diagrams) {
    if (!root.contains(diagram)) continue;

    const source = diagram.querySelector(".mermaid-source")?.textContent ?? "";
    diagram.dataset.mermaidState = "rendering";
    try {
      const parsed = await mermaid.parse(source, { suppressErrors: true });
      if (!parsed) throw new Error("Invalid Mermaid syntax");

      const id = `easymarkdown-mermaid-${++diagramSequence}`;
      const { svg } = await mermaid.render(id, source);
      if (!root.contains(diagram)) continue;

      diagram.innerHTML = svg;
      diagram.dataset.mermaidState = "rendered";
    } catch {
      if (root.contains(diagram)) showMermaidError(diagram);
    }
  }
}
