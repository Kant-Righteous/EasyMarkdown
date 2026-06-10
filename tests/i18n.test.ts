import test from "node:test";
import assert from "node:assert/strict";
import {
  LANGUAGE_STORAGE_KEY,
  loadLanguage,
  normalizeLanguage,
  setLanguage,
  t,
  type LanguageStorage,
} from "../src/i18n.ts";

function storage(initial: string | null = null): LanguageStorage {
  let value = initial;
  return {
    getItem: () => value,
    setItem: (_key, next) => {
      value = next;
    },
  };
}

test("语言值只接受中文、英语和法语", () => {
  assert.equal(normalizeLanguage("zh-CN"), "zh-CN");
  assert.equal(normalizeLanguage("en"), "en");
  assert.equal(normalizeLanguage("fr"), "fr");
  assert.equal(normalizeLanguage("de"), "zh-CN");
});

test("读取语言设置并对无效值回退到中文", () => {
  assert.equal(loadLanguage(storage("fr")), "fr");
  assert.equal(loadLanguage(storage("invalid")), "zh-CN");
});

test("切换语言后持久化并返回对应翻译", () => {
  const store = storage();
  setLanguage("en", store);
  assert.equal(store.getItem(LANGUAGE_STORAGE_KEY), "en");
  assert.equal(t("menu.action"), "Actions");

  setLanguage("fr", store);
  assert.equal(t("menu.language"), "Langue");

  setLanguage("zh-CN", store);
});
