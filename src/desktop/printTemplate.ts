import printStyles from "./print.css?raw";
import { getLanguage, t } from "../shared/i18n/i18n";
import { buildPrintDocument } from "../shared/markdown/printDocument";

export function buildPrintHtml(options: {
  title: string;
  bodyHtml: string;
}): string {
  return buildPrintDocument({
    ...options,
    language: getLanguage(),
    styles: printStyles,
    saveLabel: t("print.savePdf"),
    cancelLabel: t("print.cancelPreview"),
  });
}
