import { writeFile } from "node:fs/promises";

const targets = await fetch("http://127.0.0.1:9223/json/list").then((response) =>
  response.json(),
);
const target = targets.find((item) => item.type === "page");
if (!target) throw new Error("No Chrome page target found");

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let nextId = 1;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id) return;
  const handler = pending.get(message.id);
  if (!handler) return;
  pending.delete(message.id);
  if (message.error) handler.reject(new Error(message.error.message));
  else handler.resolve(message.result);
});

function send(method, params = {}) {
  const id = nextId++;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
  });
}

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

await send("Emulation.setDeviceMetricsOverride", {
  width: 760,
  height: 700,
  deviceScaleFactor: 1,
  mobile: false,
});
await send("Runtime.evaluate", {
  expression:
    'localStorage.setItem("easymarkdown.language.v1", "zh-CN"); location.reload();',
});
await wait(1200);
await send("Runtime.evaluate", {
  expression:
    'document.querySelector("[data-format-group=emphasisGroup] .format-overflow-trigger:not([hidden])")?.click()',
});
await wait(150);

const result = await send("Runtime.evaluate", {
  returnByValue: true,
  expression: `JSON.stringify((() => {
    const panel = document.querySelector("[data-format-group=emphasisGroup] .format-overflow-panel:not([hidden])");
    const buttons = panel ? [...panel.querySelectorAll(".format-command")] : [];
    return {
      viewport: [window.innerWidth, window.innerHeight],
      quoteIcon: document.querySelector("[data-command=blockquote] .format-icon-quote") !== null,
      footnoteIcon: document.querySelector("[data-command=footnote] .format-icon-footnote") !== null,
      menuOpen: Boolean(panel),
      visibleOverflowGroups: [...document.querySelectorAll(".format-overflow-trigger:not([hidden])")].map(
        (trigger) => trigger.closest("[data-format-group]")?.dataset.formatGroup,
      ),
      panelWidth: panel ? getComputedStyle(panel).width : null,
      buttonLayouts: buttons.map((button) => ({
        command: button.dataset.command,
        display: getComputedStyle(button).display,
        columns: getComputedStyle(button).gridTemplateColumns,
        height: getComputedStyle(button).height,
        labelAlign: getComputedStyle(button.querySelector(".format-menu-label")).textAlign,
      })),
      toolbarWithinViewport: document.querySelector(".format-bar").scrollWidth <= window.innerWidth,
    };
  })())`,
});

const screenshot = await send("Page.captureScreenshot", {
  format: "png",
  captureBeyondViewport: false,
});
await writeFile(
  ".superpowers/screenshots/toolbar-polish-760.png",
  Buffer.from(screenshot.data, "base64"),
);

console.log(result.result.value);
await send("Browser.close");
socket.close();
