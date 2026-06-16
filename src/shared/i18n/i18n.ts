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
    "menu.rename": "重命名",
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
    "format.underline": "下划线",
    "format.strikethrough": "删除线",
    "format.highlight": "高亮",
    "format.listGroup": "列表",
    "format.list": "列表",
    "format.unordered": "无序列表",
    "format.ordered": "有序列表",
    "format.task": "任务列表",
    "format.blockGroup": "块级格式",
    "format.block": "块级",
    "format.quote": "引用",
    "format.code": "代码块",
    "format.formulaBlock": "公式块",
    "format.chart": "图表",
    "format.insertGroup": "插入",
    "format.insert": "插入",
    "format.link": "超链接",
    "format.image": "图片",
    "format.table": "表格",
    "format.rule": "水平分割线",
    "format.inlineCode": "内联代码",
    "format.inlineFormula": "内联公式",
    "format.footnote": "脚注",
    "format.moreHeading": "更多标题功能",
    "format.moreEmphasis": "更多强调功能",
    "format.moreList": "更多列表功能",
    "format.moreBlock": "更多块级功能",
    "format.moreInsert": "更多插入功能",
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
    "file.unsavedTitle": "未保存的修改",
    "file.saveChanges": "保存",
    "file.discardChanges": "不保存",
    "file.cancelChanges": "取消",
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
    "sidebar.label": "文档侧栏",
    "sidebar.tabs": "侧栏内容",
    "sidebar.toggle": "切换侧栏",
    "sidebar.resize": "调整侧栏宽度",
    "split.resize": "调整编辑区和预览区宽度",
    "sidebar.files": "文件",
    "sidebar.outline": "大纲",
    "sidebar.outlineEmpty": "大纲内容为空",
    "sidebar.openNewWindow": "在新窗口打开",
    "sidebar.deleteRecent": "删除",
    "sidebar.deleteTitle": "删除最近文件",
    "sidebar.deleteMessage": "请选择如何处理：\n{path}",
    "sidebar.removeRecord": "仅移除记录",
    "sidebar.deleteFile": "同时删除磁盘文件",
    "sidebar.cancelDelete": "取消",
    "sidebar.deleteFailed": "删除文件失败：{message}",
    "sidebar.collapse": "折叠目录",
    "sidebar.expand": "展开目录",
    "command.item1": "第一项",
    "command.item2": "第二项",
    "command.item3": "第三项",
    "command.heading": "标题",
    "command.bold": "加粗文字",
    "command.italic": "斜体文字",
    "command.underline": "下划线文字",
    "command.strikethrough": "删除线文字",
    "command.highlight": "高亮文字",
    "command.quote": "引用内容",
    "command.code": "代码内容",
    "command.formula": "公式内容",
    "command.chartStart": "开始",
    "command.chartEnd": "结束",
    "command.link": "链接文字",
    "command.image": "图片说明",
    "command.inlineCode": "代码",
    "command.inlineFormula": "公式",
    "command.footnote": "脚注内容",
    "preview.mermaidError": "图表语法有误，已保留源码。",
    "preview.copyBlock": "复制",
    "preview.copySuccess": "已复制",
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
    "rename.title": "重命名文件",
    "rename.name": "文件名",
    "rename.confirm": "重命名",
    "rename.cancel": "取消",
    "rename.empty": "文件名不能为空。",
    "rename.invalid": "文件名包含无效字符，或以空格、句点结尾。",
    "rename.failed": "无法重命名文件。",
    "context.emoji": "表情符号",
    "context.undo": "撤消",
    "context.cut": "剪切",
    "context.copy": "复制",
    "context.paste": "粘贴",
    "context.pastePlain": "粘贴为纯文本",
    "context.selectAll": "全选",
    "context.refresh": "刷新",
    "context.saveAs": "另存为",
    "context.print": "打印",
    "context.rename": "重命名",
    "context.inspect": "检查",
  },
  en: {
    "app.toolbar": "File, actions, and view menus",
    "menu.file": "File",
    "menu.new": "New",
    "menu.open": "Open",
    "menu.recent": "Open Recent",
    "menu.save": "Save",
    "menu.saveAs": "Save As",
    "menu.rename": "Rename",
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
    "format.underline": "Underline",
    "format.strikethrough": "Strikethrough",
    "format.highlight": "Highlight",
    "format.listGroup": "Lists",
    "format.list": "List",
    "format.unordered": "Bulleted list",
    "format.ordered": "Numbered list",
    "format.task": "Task list",
    "format.blockGroup": "Block formatting",
    "format.block": "Block",
    "format.quote": "Quote",
    "format.code": "Code block",
    "format.formulaBlock": "Formula block",
    "format.chart": "Diagram",
    "format.insertGroup": "Insert",
    "format.insert": "Insert",
    "format.link": "Hyperlink",
    "format.image": "Image",
    "format.table": "Table",
    "format.rule": "Horizontal rule",
    "format.inlineCode": "Inline code",
    "format.inlineFormula": "Inline formula",
    "format.footnote": "Footnote",
    "format.moreHeading": "More heading tools",
    "format.moreEmphasis": "More emphasis tools",
    "format.moreList": "More list tools",
    "format.moreBlock": "More block tools",
    "format.moreInsert": "More insert tools",
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
    "file.unsavedTitle": "Unsaved Changes",
    "file.saveChanges": "Save",
    "file.discardChanges": "Don't Save",
    "file.cancelChanges": "Cancel",
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
    "sidebar.label": "Document sidebar",
    "sidebar.tabs": "Sidebar content",
    "sidebar.toggle": "Toggle sidebar",
    "sidebar.resize": "Resize sidebar",
    "split.resize": "Resize editor and preview",
    "sidebar.files": "Files",
    "sidebar.outline": "Outline",
    "sidebar.outlineEmpty": "The outline is empty",
    "sidebar.openNewWindow": "Open in New Window",
    "sidebar.deleteRecent": "Delete",
    "sidebar.deleteTitle": "Delete Recent File",
    "sidebar.deleteMessage": "Choose how to handle this file:\n{path}",
    "sidebar.removeRecord": "Remove from Recent",
    "sidebar.deleteFile": "Also Delete File",
    "sidebar.cancelDelete": "Cancel",
    "sidebar.deleteFailed": "Failed to delete the file: {message}",
    "sidebar.collapse": "Collapse section",
    "sidebar.expand": "Expand section",
    "command.item1": "First item",
    "command.item2": "Second item",
    "command.item3": "Third item",
    "command.heading": "Heading",
    "command.bold": "bold text",
    "command.italic": "italic text",
    "command.underline": "underlined text",
    "command.strikethrough": "struck text",
    "command.highlight": "highlighted text",
    "command.quote": "Quoted text",
    "command.code": "Code",
    "command.formula": "formula",
    "command.chartStart": "Start",
    "command.chartEnd": "End",
    "command.link": "link text",
    "command.image": "image description",
    "command.inlineCode": "code",
    "command.inlineFormula": "formula",
    "command.footnote": "Footnote text",
    "preview.mermaidError":
      "The diagram syntax is invalid. The source has been preserved.",
    "preview.copyBlock": "Copy",
    "preview.copySuccess": "Copied",
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
    "rename.title": "Rename File",
    "rename.name": "File name",
    "rename.confirm": "Rename",
    "rename.cancel": "Cancel",
    "rename.empty": "The file name cannot be empty.",
    "rename.invalid": "The file name contains invalid characters or ends with a space or period.",
    "rename.failed": "Could not rename the file.",
    "context.emoji": "Emoji",
    "context.undo": "Undo",
    "context.cut": "Cut",
    "context.copy": "Copy",
    "context.paste": "Paste",
    "context.pastePlain": "Paste as plain text",
    "context.selectAll": "Select all",
    "context.refresh": "Refresh",
    "context.saveAs": "Save As",
    "context.print": "Print",
    "context.rename": "Rename",
    "context.inspect": "Inspect",
  },
  fr: {
    "app.toolbar": "Menus Fichier, actions et affichage",
    "menu.file": "Fichier",
    "menu.new": "Nouveau",
    "menu.open": "Ouvrir",
    "menu.recent": "Ouvrir récent",
    "menu.save": "Enregistrer",
    "menu.saveAs": "Enregistrer sous",
    "menu.rename": "Renommer",
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
    "format.underline": "Souligner",
    "format.strikethrough": "Barré",
    "format.highlight": "Surligner",
    "format.listGroup": "Listes",
    "format.list": "Liste",
    "format.unordered": "Liste à puces",
    "format.ordered": "Liste numérotée",
    "format.task": "Liste de tâches",
    "format.blockGroup": "Mise en forme des blocs",
    "format.block": "Bloc",
    "format.quote": "Citation",
    "format.code": "Bloc de code",
    "format.formulaBlock": "Bloc de formule",
    "format.chart": "Diagramme",
    "format.insertGroup": "Insertion",
    "format.insert": "Insérer",
    "format.link": "Hyperlien",
    "format.image": "Image",
    "format.table": "Tableau",
    "format.rule": "Ligne horizontale",
    "format.inlineCode": "Code en ligne",
    "format.inlineFormula": "Formule en ligne",
    "format.footnote": "Note de bas de page",
    "format.moreHeading": "Plus d'outils de titre",
    "format.moreEmphasis": "Plus d'outils d'emphase",
    "format.moreList": "Plus d'outils de liste",
    "format.moreBlock": "Plus d'outils de bloc",
    "format.moreInsert": "Plus d'outils d'insertion",
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
    "file.unsavedTitle": "Modifications non enregistrées",
    "file.saveChanges": "Enregistrer",
    "file.discardChanges": "Ne pas enregistrer",
    "file.cancelChanges": "Annuler",
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
    "sidebar.label": "Barre latérale du document",
    "sidebar.tabs": "Contenu de la barre latérale",
    "sidebar.toggle": "Afficher ou masquer la barre latérale",
    "sidebar.resize": "Redimensionner la barre latérale",
    "split.resize": "Redimensionner l'éditeur et l'aperçu",
    "sidebar.files": "Fichiers",
    "sidebar.outline": "Plan",
    "sidebar.outlineEmpty": "Le plan est vide",
    "sidebar.openNewWindow": "Ouvrir dans une nouvelle fenêtre",
    "sidebar.deleteRecent": "Supprimer",
    "sidebar.deleteTitle": "Supprimer un fichier récent",
    "sidebar.deleteMessage": "Choisissez comment traiter ce fichier :\n{path}",
    "sidebar.removeRecord": "Retirer des fichiers récents",
    "sidebar.deleteFile": "Supprimer aussi le fichier",
    "sidebar.cancelDelete": "Annuler",
    "sidebar.deleteFailed": "Impossible de supprimer le fichier : {message}",
    "sidebar.collapse": "Réduire la section",
    "sidebar.expand": "Développer la section",
    "command.item1": "Premier élément",
    "command.item2": "Deuxième élément",
    "command.item3": "Troisième élément",
    "command.heading": "Titre",
    "command.bold": "texte en gras",
    "command.italic": "texte en italique",
    "command.underline": "texte souligné",
    "command.strikethrough": "texte barré",
    "command.highlight": "texte surligné",
    "command.quote": "Texte cité",
    "command.code": "Code",
    "command.formula": "formule",
    "command.chartStart": "Début",
    "command.chartEnd": "Fin",
    "command.link": "texte du lien",
    "command.image": "description de l'image",
    "command.inlineCode": "code",
    "command.inlineFormula": "formule",
    "command.footnote": "Texte de la note",
    "preview.mermaidError":
      "La syntaxe du diagramme est invalide. Le code source a été conservé.",
    "preview.copyBlock": "Copier",
    "preview.copySuccess": "Copié",
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
    "rename.title": "Renommer le fichier",
    "rename.name": "Nom du fichier",
    "rename.confirm": "Renommer",
    "rename.cancel": "Annuler",
    "rename.empty": "Le nom du fichier ne peut pas être vide.",
    "rename.invalid": "Le nom contient des caractères non valides ou se termine par un espace ou un point.",
    "rename.failed": "Impossible de renommer le fichier.",
    "context.emoji": "Emoji",
    "context.undo": "Annuler",
    "context.cut": "Couper",
    "context.copy": "Copier",
    "context.paste": "Coller",
    "context.pastePlain": "Coller en texte brut",
    "context.selectAll": "Tout sélectionner",
    "context.refresh": "Actualiser",
    "context.saveAs": "Enregistrer sous",
    "context.print": "Imprimer",
    "context.rename": "Renommer",
    "context.inspect": "Inspecter",
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
