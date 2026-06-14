import test from "node:test";
import assert from "node:assert/strict";
import { getRecentDeleteDecision } from "../src/recentDelete.ts";

const labels = {
  record: "Remove from Recent",
  file: "Delete File",
};

test("maps recent delete dialog results", () => {
  assert.equal(
    getRecentDeleteDecision("Remove from Recent", labels),
    "record",
  );
  assert.equal(getRecentDeleteDecision("Delete File", labels), "file");
  assert.equal(getRecentDeleteDecision(false, labels), "cancel");
  assert.equal(getRecentDeleteDecision(null, labels), "cancel");
  assert.equal(getRecentDeleteDecision("unexpected", labels), "cancel");
});
