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

test("未保存确认使用通用的保存、不保存和取消文案", () => {
  setLanguage("zh-CN", storage());
  assert.equal(t("file.saveChanges"), "保存");
  assert.equal(t("file.discardChanges"), "不保存");
  assert.equal(t("file.cancelChanges"), "取消");

  setLanguage("en", storage());
  assert.equal(t("file.saveChanges"), "Save");
  assert.equal(t("file.discardChanges"), "Don't Save");
  assert.equal(t("file.cancelChanges"), "Cancel");

  setLanguage("fr", storage());
  assert.equal(t("file.saveChanges"), "Enregistrer");
  assert.equal(t("file.discardChanges"), "Ne pas enregistrer");
  assert.equal(t("file.cancelChanges"), "Annuler");

  setLanguage("zh-CN", storage());
});

test("重命名和自定义右键菜单文案同步三种语言", () => {
  setLanguage("zh-CN", storage());
  assert.equal(t("menu.rename"), "重命名");
  assert.equal(t("context.inspect"), "检查");

  setLanguage("en", storage());
  assert.equal(t("menu.rename"), "Rename");
  assert.equal(t("context.inspect"), "Inspect");

  setLanguage("fr", storage());
  assert.equal(t("menu.rename"), "Renommer");
  assert.equal(t("context.inspect"), "Inspecter");

  setLanguage("zh-CN", storage());
});

test("新增格式命令提供中文、英文和法文文案", () => {
  setLanguage("zh-CN", storage());
  assert.equal(t("format.highlight"), "高亮");
  assert.equal(t("format.inlineFormula"), "内联公式");

  setLanguage("en", storage());
  assert.equal(t("format.highlight"), "Highlight");
  assert.equal(t("format.inlineFormula"), "Inline formula");

  setLanguage("fr", storage());
  assert.equal(t("format.highlight"), "Surligner");
  assert.equal(t("format.inlineFormula"), "Formule en ligne");

  setLanguage("zh-CN", storage());
});

test("Mermaid errors have localized fallback text", () => {
  setLanguage("zh-CN", storage());
  assert.equal(t("preview.mermaidError"), "图表语法有误，已保留源码。");

  setLanguage("en", storage());
  assert.equal(
    t("preview.mermaidError"),
    "The diagram syntax is invalid. The source has been preserved.",
  );

  setLanguage("fr", storage());
  assert.equal(
    t("preview.mermaidError"),
    "La syntaxe du diagramme est invalide. Le code source a été conservé.",
  );

  setLanguage("zh-CN", storage());
});

test("preview block copy controls have localized labels", () => {
  setLanguage("zh-CN", storage());
  assert.equal(t("preview.copyBlock"), "复制");
  assert.equal(t("preview.copySuccess"), "已复制");

  setLanguage("en", storage());
  assert.equal(t("preview.copyBlock"), "Copy");
  assert.equal(t("preview.copySuccess"), "Copied");

  setLanguage("fr", storage());
  assert.equal(t("preview.copyBlock"), "Copier");
  assert.equal(t("preview.copySuccess"), "Copié");

  setLanguage("zh-CN", storage());
});
