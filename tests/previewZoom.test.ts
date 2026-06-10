import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_PREVIEW_ZOOM,
  getPreviewZoomFromAction,
  getNextPreviewZoom,
  normalizePreviewZoom,
  parsePreviewZoomInput,
} from "../src/previewZoom.ts";

test("预览缩放限制在 50% 到 200%", () => {
  assert.equal(normalizePreviewZoom(0.2), 0.5);
  assert.equal(normalizePreviewZoom(3), 2);
  assert.equal(normalizePreviewZoom(Number.NaN), DEFAULT_PREVIEW_ZOOM);
});

test("滚轮按 10% 调整预览缩放", () => {
  assert.equal(getNextPreviewZoom(1, -120), 1.1);
  assert.equal(getNextPreviewZoom(1, 120), 0.9);
  assert.equal(getNextPreviewZoom(2, -120), 2);
  assert.equal(getNextPreviewZoom(0.5, 120), 0.5);
});

test("缩放控件支持减小、增大和重置", () => {
  assert.equal(getPreviewZoomFromAction(1, "decrease"), 0.9);
  assert.equal(getPreviewZoomFromAction(1, "increase"), 1.1);
  assert.equal(getPreviewZoomFromAction(1.6, "reset"), 1);
});

test("缩放输入支持数字和百分号并限制范围", () => {
  assert.equal(parsePreviewZoomInput("50"), 0.5);
  assert.equal(parsePreviewZoomInput("125%"), 1.25);
  assert.equal(parsePreviewZoomInput("250"), 2);
  assert.equal(parsePreviewZoomInput("abc"), null);
});
