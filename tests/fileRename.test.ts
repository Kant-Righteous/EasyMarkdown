import test from "node:test";
import assert from "node:assert/strict";
import {
  buildRenamedPath,
  getRenameValidationError,
} from "../src/fileRename.ts";

test("rename keeps the file in its original directory", () => {
  assert.equal(
    buildRenamedPath("C:\\docs\\old.md", "new.md"),
    "C:\\docs\\new.md",
  );
  assert.equal(
    buildRenamedPath("/tmp/old.markdown", "new.markdown"),
    "/tmp/new.markdown",
  );
});

test("rename rejects empty, path and Windows-invalid names", () => {
  assert.equal(getRenameValidationError(""), "empty");
  assert.equal(getRenameValidationError("folder/name.md"), "invalid");
  assert.equal(getRenameValidationError("folder\\name.md"), "invalid");
  assert.equal(getRenameValidationError('bad:name.md'), "invalid");
  assert.equal(getRenameValidationError("valid name.md"), null);
});
