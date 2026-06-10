import test from "node:test";
import assert from "node:assert/strict";
import {
  LANGUAGE_STORAGE_KEY,
  languageFromSystemLocale,
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

test("首次启动根据 Windows 系统语言选择语言", () => {
  assert.equal(languageFromSystemLocale("zh-CN"), "zh-CN");
  assert.equal(languageFromSystemLocale("fr-FR"), "fr");
  assert.equal(languageFromSystemLocale("en-US"), "en");
  assert.equal(languageFromSystemLocale("de-DE"), "en");
});

test("优先读取已保存语言，否则使用系统语言", () => {
  assert.equal(loadLanguage(storage("fr"), "zh-CN"), "fr");
  assert.equal(loadLanguage(storage(null), "zh-CN"), "zh-CN");
  assert.equal(loadLanguage(storage(null), "fr-FR"), "fr");
  assert.equal(loadLanguage(storage("invalid"), "en-US"), "en");
});

test("安装器语言只在安装后的首次启动覆盖已保存语言", () => {
  assert.equal(loadLanguage(storage("zh-CN"), "zh-CN", "fr"), "fr");
  assert.equal(loadLanguage(storage("fr"), "fr-FR", "en"), "en");
  assert.equal(loadLanguage(storage("fr"), "zh-CN", null), "fr");
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
