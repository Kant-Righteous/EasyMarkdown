import { writeFile } from "node:fs/promises";

const targets = await fetch("http://127.0.0.1:9224/json/list").then((response) =>
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

await send("Runtime.evaluate", {
  expression: `(() => {
    const editor = document.querySelector("#editor");
    editor.value = ${JSON.stringify(`# 扩展预览

内联公式 $E=mc^2$。

$$
\\int_0^1 x^2\\,dx
$$

这是 ==高亮内容==。

- [ ] 待办
- [x] 完成

正文脚注[^1]

[^1]: 脚注内容

\`\`\`mermaid
flowchart LR
  A[开始] --> B[结束]
\`\`\`

\`\`\`mermaid
flowchart ???
\`\`\`
`)};
    editor.dispatchEvent(new Event("input", { bubbles: true }));
  })()`,
});
await wait(2500);

const result = await send("Runtime.evaluate", {
  returnByValue: true,
  expression: `JSON.stringify((() => {
    const preview = document.querySelector("#preview");
    const diagrams = [...preview.querySelectorAll(".mermaid-diagram")];
    return {
      katexInline: preview.querySelectorAll(".katex").length,
      katexBlocks: preview.querySelectorAll(".katex-display").length,
      taskCheckboxes: preview.querySelectorAll('.task-list-item-checkbox[disabled]').length,
      marks: preview.querySelectorAll("mark").length,
      footnoteRefs: preview.querySelectorAll(".footnote-ref").length,
      footnotes: preview.querySelectorAll(".footnotes").length,
      mermaidRendered: diagrams.filter((item) => item.dataset.mermaidState === "rendered" && item.querySelector("svg")).length,
      mermaidErrors: diagrams.filter((item) => item.dataset.mermaidState === "error" && item.querySelector(".mermaid-error")).length,
      rawDollarText: preview.textContent.includes("$$"),
      viewportOverflow: preview.scrollWidth > preview.clientWidth,
    };
  })())`,
});

const screenshot = await send("Page.captureScreenshot", {
  format: "png",
  captureBeyondViewport: false,
});
await writeFile(
  ".superpowers/screenshots/markdown-extensions.png",
  Buffer.from(screenshot.data, "base64"),
);

console.log(result.result.value);
await send("Browser.close");
socket.close();
