const browserProtocols = new Set(["http:", "https:", "mailto:", "tel:"]);

export function getBrowserUrl(href: string): string | null {
  try {
    const url = new URL(href);
    return browserProtocols.has(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
