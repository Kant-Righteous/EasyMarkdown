import { openUrl } from "@tauri-apps/plugin-opener";
import { t } from "../shared/i18n/i18n";
import { getBrowserUrl } from "../shared/utils/externalUrl";

let previewLinksBound = false;

export function bindPreviewLinks(): void {
  if (previewLinksBound) return;

  const preview = document.querySelector<HTMLElement>("#preview");
  if (!preview) return;
  previewLinksBound = true;

  preview.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const link = target.closest<HTMLAnchorElement>(
      'a[data-external-link="true"][href]',
    );
    if (!link) return;

    event.preventDefault();
    const href = link.getAttribute("href");
    if (!href) return;
    const browserUrl = getBrowserUrl(href);
    if (!browserUrl) {
      window.alert(t("link.unsupported"));
      return;
    }

    void openUrl(browserUrl).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      window.alert(t("link.openFailed", { message }));
    });
  });
}
