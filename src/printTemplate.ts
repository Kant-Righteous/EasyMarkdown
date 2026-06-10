import printStyles from "./print.css?raw";
import { getLanguage, t } from "./i18n";
import { buildPrintDocument } from "./printDocument";

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
