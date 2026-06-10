export type Language = "zh-CN" | "en" | "fr";

export interface LanguageStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const LANGUAGE_STORAGE_KEY = "easymarkdown.language.v1";

const translations: Record<Language, Record<string, string>> = {
  "zh-CN": {
    "app.toolbar": "文件、操作与视图菜单",
    "menu.file": "文件",
    "menu.new": "新建",
    "menu.open": "打开",
    "menu.recent": "最近打开",
    "menu.save": "保存",
    "menu.saveAs": "另存为",
    "menu.exportPdf": "导出 PDF",
    "menu.action": "操作",
    "menu.undo": "撤销",
    "menu.redo": "重做",
    "menu.language": "语言",
    "language.zh-CN": "中文",
    "language.en": "English",
    "language.fr": "Français",
    "ai.mode": "AI 对话保存模式",
    "view.group": "视图模式",
    "view.edit": "编辑",
    "view.preview": "预览",
    "view.split": "分屏",
    "format.toolbar": "Markdown 格式工具栏",
    "format.headingGroup": "标题",
    "format.heading": "标题",
    "format.h1": "一级标题",
    "format.h2": "二级标题",
    "format.h3": "三级标题",
    "format.emphasisGroup": "文字强调",
    "format.emphasis": "强调",
    "format.bold": "加粗",
    "format.italic": "斜体",
    "format.listGroup": "列表",
    "format.list": "列表",
    "format.unordered": "• 无序",
    "format.ordered": "1. 有序",
    "format.blockGroup": "块级格式",
    "format.block": "块级",
    "format.quote": "❝ 引用",
    "format.code": "</> 代码",
    "format.insertGroup": "插入",
    "format.insert": "插入",
    "format.link": "↗ 链接",
    "format.table": "▦ 表格",
    "format.rule": "— 横线",
    "ai.group": "AI 对话模板",
    "ai.label": "AI 对话",
    "ai.prompt": "👤 用户提示词",
    "ai.response": "🤖 AI 回答",
    "editor.label": "Markdown 编辑区",
    "editor.placeholder": "在这里输入 Markdown...",
    "preview.label": "Markdown 预览区",
    "status.unsavedFile": "未保存文件",
    "status.saved": "已保存",
    "status.unsaved": "未保存",
    "zoom.group": "内容缩放",
    "zoom.value": "缩放百分比",
    "zoom.decrease": "缩小",
    "zoom.increase": "放大",
    "zoom.reset": "重置",
    "file.untitled": "未命名.md",
    "file.discardConfirm": "当前内容尚未保存。确定要放弃这些修改吗？",
    "file.unsavedMessage": "当前文件有未保存的修改。",
    "file.openTitle": "打开文件",
    "file.openTargetMessage": "请选择在哪里打开文件。",
    "file.openCurrentWindow": "在当前窗口打开",
    "file.openNewWindow": "在新窗口打开",
    "file.saveAndOpen": "保存并打开",
    "file.discardAndOpen": "不保存并打开",
    "file.cancelOpen": "取消打开",
    "file.openAction": "打开文件",
    "file.saveAction": "保存文件",
    "file.actionFailed": "{action}失败：{message}",
    "close.message": "文件尚未保存，是否保存后关闭？",
    "close.title": "未保存的更改",
    "close.saveAndClose": "保存并关闭",
    "close.discardAndClose": "不保存并关闭",
    "close.cancel": "取消",
    "recent.empty": "暂无最近文件",
    "recent.openCurrent": "在当前窗口打开",
    "recent.openNew": "在新窗口打开",
    "recent.clear": "清空最近记录",
    "recent.newWindowFailed": "创建新窗口失败：{message}",
    "command.item1": "第一项",
    "command.item2": "第二项",
    "command.item3": "第三项",
    "command.heading": "标题",
    "command.bold": "加粗文字",
    "command.italic": "斜体文字",
    "command.quote": "引用内容",
    "command.code": "代码内容",
    "command.link": "链接文字",
    "command.column1": "列1",
    "command.column2": "列2",
    "command.column3": "列3",
    "command.content1": "内容1",
    "command.content2": "内容2",
    "command.content3": "内容3",
    "editor.notFound": "找不到 Markdown 编辑器",
    "link.openFailed": "无法在浏览器中打开链接：{message}",
    "link.unsupported": "此链接不是可在浏览器中打开的外部链接。",
    "print.closePreview": "关闭打印预览",
    "print.previewTitle": "PDF 打印预览",
    "print.action": "打印 / 保存为 PDF",
    "print.exportFailed": "导出 PDF 失败：{message}",
    "print.savePdf": "保存为 PDF",
    "print.cancelPreview": "取消",
  },
  en: {
    "app.toolbar": "File, actions, and view menus",
    "menu.file": "File",
    "menu.new": "New",
    "menu.open": "Open",
    "menu.recent": "Open Recent",
    "menu.save": "Save",
    "menu.saveAs": "Save As",
    "menu.exportPdf": "Export PDF",
    "menu.action": "Actions",
    "menu.undo": "Undo",
    "menu.redo": "Redo",
    "menu.language": "Language",
    "language.zh-CN": "中文",
    "language.en": "English",
    "language.fr": "Français",
    "ai.mode": "AI Conversation Mode",
    "view.group": "View mode",
    "view.edit": "Edit",
    "view.preview": "Preview",
    "view.split": "Split",
    "format.toolbar": "Markdown formatting toolbar",
    "format.headingGroup": "Headings",
    "format.heading": "Heading",
    "format.h1": "Heading 1",
    "format.h2": "Heading 2",
    "format.h3": "Heading 3",
    "format.emphasisGroup": "Text emphasis",
    "format.emphasis": "Emphasis",
    "format.bold": "Bold",
    "format.italic": "Italic",
    "format.listGroup": "Lists",
    "format.list": "List",
    "format.unordered": "• Bulleted",
    "format.ordered": "1. Numbered",
    "format.blockGroup": "Block formatting",
    "format.block": "Block",
    "format.quote": "❝ Quote",
    "format.code": "</> Code",
    "format.insertGroup": "Insert",
    "format.insert": "Insert",
    "format.link": "↗ Link",
    "format.table": "▦ Table",
    "format.rule": "— Rule",
    "ai.group": "AI conversation templates",
    "ai.label": "AI Conversation",
    "ai.prompt": "👤 User Prompt",
    "ai.response": "🤖 AI Response",
    "editor.label": "Markdown editor",
    "editor.placeholder": "Enter Markdown here...",
    "preview.label": "Markdown preview",
    "status.unsavedFile": "Unsaved file",
    "status.saved": "Saved",
    "status.unsaved": "Unsaved",
    "zoom.group": "Content zoom",
    "zoom.value": "Zoom percentage",
    "zoom.decrease": "Zoom out",
    "zoom.increase": "Zoom in",
    "zoom.reset": "Reset",
    "file.untitled": "Untitled.md",
    "file.discardConfirm": "This content has not been saved. Discard the changes?",
    "file.unsavedMessage": "The current file has unsaved changes.",
    "file.openTitle": "Open File",
    "file.openTargetMessage": "Choose where to open the file.",
    "file.openCurrentWindow": "Open in Current Window",
    "file.openNewWindow": "Open in New Window",
    "file.saveAndOpen": "Save and Open",
    "file.discardAndOpen": "Open Without Saving",
    "file.cancelOpen": "Cancel",
    "file.openAction": "Open file",
    "file.saveAction": "Save file",
    "file.actionFailed": "{action} failed: {message}",
    "close.message": "This file has not been saved. Save it before closing?",
    "close.title": "Unsaved Changes",
    "close.saveAndClose": "Save and Close",
    "close.discardAndClose": "Close Without Saving",
    "close.cancel": "Cancel",
    "recent.empty": "No recent files",
    "recent.openCurrent": "Open in Current Window",
    "recent.openNew": "Open in New Window",
    "recent.clear": "Clear Recent Files",
    "recent.newWindowFailed": "Failed to create a new window: {message}",
    "command.item1": "First item",
    "command.item2": "Second item",
    "command.item3": "Third item",
    "command.heading": "Heading",
    "command.bold": "bold text",
    "command.italic": "italic text",
    "command.quote": "Quoted text",
    "command.code": "Code",
    "command.link": "link text",
    "command.column1": "Column 1",
    "command.column2": "Column 2",
    "command.column3": "Column 3",
    "command.content1": "Content 1",
    "command.content2": "Content 2",
    "command.content3": "Content 3",
    "editor.notFound": "Markdown editor not found",
    "link.openFailed": "Could not open the link in your browser: {message}",
    "link.unsupported": "This is not an external link that can be opened in a browser.",
    "print.closePreview": "Close Print Preview",
    "print.previewTitle": "PDF Print Preview",
    "print.action": "Print / Save as PDF",
    "print.exportFailed": "Failed to export PDF: {message}",
    "print.savePdf": "Save as PDF",
    "print.cancelPreview": "Cancel",
  },
  fr: {
    "app.toolbar": "Menus Fichier, actions et affichage",
    "menu.file": "Fichier",
    "menu.new": "Nouveau",
    "menu.open": "Ouvrir",
    "menu.recent": "Ouvrir récent",
    "menu.save": "Enregistrer",
    "menu.saveAs": "Enregistrer sous",
    "menu.exportPdf": "Exporter en PDF",
    "menu.action": "Actions",
    "menu.undo": "Annuler",
    "menu.redo": "Rétablir",
    "menu.language": "Langue",
    "language.zh-CN": "中文",
    "language.en": "English",
    "language.fr": "Français",
    "ai.mode": "Mode dialogue IA",
    "view.group": "Mode d'affichage",
    "view.edit": "Édition",
    "view.preview": "Aperçu",
    "view.split": "Partagé",
    "format.toolbar": "Barre de mise en forme Markdown",
    "format.headingGroup": "Titres",
    "format.heading": "Titre",
    "format.h1": "Titre niveau 1",
    "format.h2": "Titre niveau 2",
    "format.h3": "Titre niveau 3",
    "format.emphasisGroup": "Mise en valeur du texte",
    "format.emphasis": "Style",
    "format.bold": "Gras",
    "format.italic": "Italique",
    "format.listGroup": "Listes",
    "format.list": "Liste",
    "format.unordered": "• À puces",
    "format.ordered": "1. Numérotée",
    "format.blockGroup": "Mise en forme des blocs",
    "format.block": "Bloc",
    "format.quote": "❝ Citation",
    "format.code": "</> Code",
    "format.insertGroup": "Insertion",
    "format.insert": "Insérer",
    "format.link": "↗ Lien",
    "format.table": "▦ Tableau",
    "format.rule": "— Ligne",
    "ai.group": "Modèles de dialogue IA",
    "ai.label": "Dialogue IA",
    "ai.prompt": "👤 Instruction utilisateur",
    "ai.response": "🤖 Réponse de l'IA",
    "editor.label": "Éditeur Markdown",
    "editor.placeholder": "Saisissez du Markdown ici...",
    "preview.label": "Aperçu Markdown",
    "status.unsavedFile": "Fichier non enregistré",
    "status.saved": "Enregistré",
    "status.unsaved": "Non enregistré",
    "zoom.group": "Zoom du contenu",
    "zoom.value": "Pourcentage de zoom",
    "zoom.decrease": "Réduire",
    "zoom.increase": "Agrandir",
    "zoom.reset": "Réinitialiser",
    "file.untitled": "Sans titre.md",
    "file.discardConfirm":
      "Ce contenu n'est pas enregistré. Abandonner les modifications ?",
    "file.unsavedMessage": "Le fichier actuel contient des modifications non enregistrées.",
    "file.openTitle": "Ouvrir un fichier",
    "file.openTargetMessage": "Choisissez où ouvrir le fichier.",
    "file.openCurrentWindow": "Ouvrir dans la fenêtre actuelle",
    "file.openNewWindow": "Ouvrir dans une nouvelle fenêtre",
    "file.saveAndOpen": "Enregistrer et ouvrir",
    "file.discardAndOpen": "Ouvrir sans enregistrer",
    "file.cancelOpen": "Annuler",
    "file.openAction": "Ouverture du fichier",
    "file.saveAction": "Enregistrement du fichier",
    "file.actionFailed": "Échec de l'action « {action} » : {message}",
    "close.message":
      "Ce fichier n'est pas enregistré. L'enregistrer avant de fermer ?",
    "close.title": "Modifications non enregistrées",
    "close.saveAndClose": "Enregistrer et fermer",
    "close.discardAndClose": "Fermer sans enregistrer",
    "close.cancel": "Annuler",
    "recent.empty": "Aucun fichier récent",
    "recent.openCurrent": "Ouvrir dans la fenêtre actuelle",
    "recent.openNew": "Ouvrir dans une nouvelle fenêtre",
    "recent.clear": "Effacer les fichiers récents",
    "recent.newWindowFailed":
      "Impossible de créer une nouvelle fenêtre : {message}",
    "command.item1": "Premier élément",
    "command.item2": "Deuxième élément",
    "command.item3": "Troisième élément",
    "command.heading": "Titre",
    "command.bold": "texte en gras",
    "command.italic": "texte en italique",
    "command.quote": "Texte cité",
    "command.code": "Code",
    "command.link": "texte du lien",
    "command.column1": "Colonne 1",
    "command.column2": "Colonne 2",
    "command.column3": "Colonne 3",
    "command.content1": "Contenu 1",
    "command.content2": "Contenu 2",
    "command.content3": "Contenu 3",
    "editor.notFound": "Éditeur Markdown introuvable",
    "link.openFailed":
      "Impossible d'ouvrir le lien dans le navigateur : {message}",
    "link.unsupported":
      "Ce lien externe ne peut pas être ouvert dans un navigateur.",
    "print.closePreview": "Fermer l'aperçu avant impression",
    "print.previewTitle": "Aperçu avant impression PDF",
    "print.action": "Imprimer / Enregistrer en PDF",
    "print.exportFailed": "Échec de l'exportation PDF : {message}",
    "print.savePdf": "Enregistrer en PDF",
    "print.cancelPreview": "Annuler",
  },
};

type LanguageListener = (language: Language) => void;

const listeners = new Set<LanguageListener>();
let currentLanguage: Language = "zh-CN";

function defaultStorage(): LanguageStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function normalizeLanguage(value: unknown): Language {
  return value === "en" || value === "fr" || value === "zh-CN"
    ? value
    : "zh-CN";
}

function isLanguage(value: unknown): value is Language {
  return value === "en" || value === "fr" || value === "zh-CN";
}

function defaultSystemLocale(): string {
  return typeof navigator === "undefined" ? "en-US" : navigator.language;
}

export function languageFromSystemLocale(locale: string): Language {
  const normalizedLocale = locale.toLowerCase();
  if (normalizedLocale === "zh-cn") return "zh-CN";
  if (normalizedLocale === "fr-fr") return "fr";
  return "en";
}

export function loadLanguage(
  storage: LanguageStorage | null = defaultStorage(),
  systemLocale = defaultSystemLocale(),
  installerLanguage: unknown = null,
): Language {
  if (isLanguage(installerLanguage)) return installerLanguage;
  if (!storage) return languageFromSystemLocale(systemLocale);
  try {
    const storedLanguage = storage.getItem(LANGUAGE_STORAGE_KEY);
    return isLanguage(storedLanguage)
      ? storedLanguage
      : languageFromSystemLocale(systemLocale);
  } catch {
    return languageFromSystemLocale(systemLocale);
  }
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function t(
  key: string,
  values: Record<string, string> = {},
): string {
  const template =
    translations[currentLanguage][key] ?? translations["zh-CN"][key] ?? key;
  return Object.entries(values).reduce(
    (result, [name, value]) => result.split(`{${name}}`).join(value),
    template,
  );
}

export function applyTranslations(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (key) element.textContent = t(key);
  });
  root
    .querySelectorAll<HTMLElement>("[data-i18n-title]")
    .forEach((element) => {
      const key = element.dataset.i18nTitle;
      if (key) element.title = t(key);
    });
  root
    .querySelectorAll<HTMLElement>("[data-i18n-aria-label]")
    .forEach((element) => {
      const key = element.dataset.i18nAriaLabel;
      if (key) element.setAttribute("aria-label", t(key));
    });
  root
    .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      "[data-i18n-placeholder]",
    )
    .forEach((element) => {
      const key = element.dataset.i18nPlaceholder;
      if (key) element.placeholder = t(key);
    });
  root
    .querySelectorAll<HTMLElement>("[data-language]")
    .forEach((element) => {
      element.setAttribute(
        "aria-checked",
        String(element.dataset.language === currentLanguage),
      );
    });
}

export function setLanguage(
  language: Language,
  storage: LanguageStorage | null = defaultStorage(),
): void {
  currentLanguage = normalizeLanguage(language);
  try {
    storage?.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
  } catch {
    // The language still applies for this session when storage is unavailable.
  }
  if (typeof document !== "undefined") {
    document.documentElement.lang = currentLanguage;
    applyTranslations();
  }
  listeners.forEach((listener) => listener(currentLanguage));
}

export function initI18n(installerLanguage: unknown = null): Language {
  const language = loadLanguage(
    defaultStorage(),
    defaultSystemLocale(),
    installerLanguage,
  );
  setLanguage(language);
  return language;
}

export function subscribeLanguage(listener: LanguageListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
