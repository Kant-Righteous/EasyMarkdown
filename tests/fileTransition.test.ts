import test from "node:test";
import assert from "node:assert/strict";
import { confirmUnsavedTransition } from "../src/fileTransition.ts";

test("clean content continues without prompting", async () => {
  let prompted = false;
  const result = await confirmUnsavedTransition({
    isDirty: false,
    prompt: async () => {
      prompted = true;
      return "cancel";
    },
    save: async () => false,
  });

  assert.equal(result, true);
  assert.equal(prompted, false);
});

test("unsaved transition follows save, discard and cancel decisions", async () => {
  assert.equal(
    await confirmUnsavedTransition({
      isDirty: true,
      prompt: async () => "save",
      save: async () => true,
    }),
    true,
  );
  assert.equal(
    await confirmUnsavedTransition({
      isDirty: true,
      prompt: async () => "save",
      save: async () => false,
    }),
    false,
  );
  assert.equal(
    await confirmUnsavedTransition({
      isDirty: true,
      prompt: async () => "discard",
      save: async () => false,
    }),
    true,
  );
  assert.equal(
    await confirmUnsavedTransition({
      isDirty: true,
      prompt: async () => "cancel",
      save: async () => true,
    }),
    false,
  );
});
