export type CloseAction = "default" | "destroy" | "keep-open";

export function getCloseAction(
  isDirty: boolean,
  saveFirst?: boolean,
  saveSucceeded?: boolean,
): CloseAction {
  if (!isDirty) return "default";
  if (!saveFirst) return "destroy";
  return saveSucceeded ? "destroy" : "keep-open";
}
