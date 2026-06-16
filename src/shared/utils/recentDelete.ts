export type RecentDeleteDecision = "record" | "file" | "cancel";

export function getRecentDeleteDecision(
  result: string | boolean | null,
  labels: { record: string; file: string },
): RecentDeleteDecision {
  if (result === labels.record) return "record";
  if (result === labels.file) return "file";
  return "cancel";
}
