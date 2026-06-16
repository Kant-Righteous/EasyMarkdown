export type CloseAction = "default" | "destroy" | "keep-open";
export type CloseDecision = "save" | "discard" | "cancel";

export function getCloseDecision(
  result: string,
  labels: { save: string; discard: string },
): CloseDecision {
  if (result === labels.save) return "save";
  if (result === labels.discard) return "discard";
  return "cancel";
}

export function getCloseAction(
  isDirty: boolean,
  decision?: CloseDecision,
  saveSucceeded?: boolean,
): CloseAction {
  if (!isDirty) return "default";
  if (decision === "discard") return "destroy";
  if (decision === "save" && saveSucceeded) return "destroy";
  return "keep-open";
}
