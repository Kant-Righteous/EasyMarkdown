import test from "node:test";
import assert from "node:assert/strict";
import {
  footnoteTemplate,
  headingText,
  nextFootnoteIndex,
  orderedListText,
  prefixedLines,
  taskListText,
  wrappedText,
} from "../src/formatting.ts";

test("标题命令替换已有标题级别而不是重复添加井号", () => {
  assert.equal(headingText("# 标题", 2, "标题"), "## 标题");
  assert.equal(headingText("正文", 3, "标题"), "### 正文");
  assert.equal(headingText("", 1, "标题"), "# 标题");
});

test("列表命令逐行生成无序、有序和任务列表", () => {
  assert.equal(prefixedLines("甲\n乙", "- ", "项目"), "- 甲\n- 乙");
  assert.equal(orderedListText("甲\n乙", "项目"), "1. 甲\n2. 乙");
  assert.equal(taskListText("甲\n乙", "项目"), "- [ ] 甲\n- [ ] 乙");
});

test("行内格式使用选区或占位文案生成包裹语法", () => {
  assert.equal(wrappedText("内容", "`", "`", "代码"), "`内容`");
  assert.equal(wrappedText("", "$", "$", "公式"), "$公式$");
  assert.equal(
    wrappedText("重点", "==", "==", "高亮"),
    "==重点==",
  );
});

test("脚注编号跳过文档中已存在的编号", () => {
  const content = "正文[^1]\n\n[^1]: 第一条\n\n其他[^3]";
  assert.equal(nextFootnoteIndex(content), 4);
  assert.equal(
    footnoteTemplate(4, "脚注内容"),
    "[^4]\n\n[^4]: 脚注内容",
  );
});
