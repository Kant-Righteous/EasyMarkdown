export interface OutlineItem {
  id: string;
  level: 1 | 2 | 3 | 4;
  text: string;
  line: number;
  offset: number;
  hasChildren: boolean;
}

function createOutlineId(
  line: number,
  level: number,
  text: string,
): string {
  let hash = 2166136261;
  for (const character of text) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `outline-${line}-${level}-${(hash >>> 0).toString(36)}`;
}

export function parseOutline(source: string): OutlineItem[] {
  const lines = Array.from(
    source.matchAll(/([^\r\n]*)(\r\n|\r|\n|$)/g),
    (match) => ({
      text: match[1],
      newlineLength: match[2].length,
    }),
  ).filter((line, index, all) => line.text || line.newlineLength || index === 0 || index < all.length - 1);
  const items: OutlineItem[] = [];
  let offset = 0;
  let fenceMarker = "";
  let fenceLength = 0;

  lines.forEach(({ text: line, newlineLength }, index) => {
    const fence = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (fence) {
      const marker = fence[1][0];
      if (!fenceMarker) {
        fenceMarker = marker;
        fenceLength = fence[1].length;
      } else if (marker === fenceMarker && fence[1].length >= fenceLength) {
        fenceMarker = "";
        fenceLength = 0;
      }
      offset += line.length + newlineLength;
      return;
    }

    if (!fenceMarker) {
      const heading = line.match(/^\s{0,3}(#{1,4})[ \t]+(.+?)\s*$/);
      if (heading) {
        const level = heading[1].length as 1 | 2 | 3 | 4;
        const text = heading[2].replace(/[ \t]+#+[ \t]*$/, "").trim();
        if (text) {
          items.push({
            id: createOutlineId(index + 1, level, text),
            level,
            text,
            line: index + 1,
            offset,
            hasChildren: false,
          });
        }
      }
    }
    offset += line.length + newlineLength;
  });

  return items.map((item, index) => ({
    ...item,
    hasChildren:
      index + 1 < items.length && items[index + 1].level > item.level,
  }));
}

export function getVisibleOutlineItems(
  items: readonly OutlineItem[],
  collapsedIds: ReadonlySet<string>,
): OutlineItem[] {
  const hiddenLevels: number[] = [];
  return items.filter((item) => {
    while (
      hiddenLevels.length > 0 &&
      item.level <= hiddenLevels[hiddenLevels.length - 1]
    ) {
      hiddenLevels.pop();
    }
    const visible = hiddenLevels.length === 0;
    if (visible && collapsedIds.has(item.id)) {
      hiddenLevels.push(item.level);
    }
    return visible;
  });
}
