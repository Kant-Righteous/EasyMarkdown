export type OpenDecision = "save" | "discard" | "cancel";

export function getOpenDecision(
  result: string,
  labels: { save: string; discard: string },
): OpenDecision {
  if (result === labels.save) return "save";
  if (result === labels.discard) return "discard";
  return "cancel";
}

export function buildOpenFileUrl(path: string): string {
  return `/?openFile=${encodeURIComponent(path)}`;
}

export function parseOpenFilePath(search: string): string | null {
  return new URLSearchParams(search).get("openFile");
}

export function createRecentWindowLabel(
  timestamp = Date.now(),
  sequence = Math.floor(Math.random() * 1_000_000),
): string {
  return `recent-${timestamp}-${sequence}`;
}
