/** A part of a markdown text: ordinary markdown, or a table (GitHub's pipe tables, as agents write their results). */
export type MarkdownBlock = {kind: 'markdown'; text: string} | {kind: 'table'; header: string[]; rows: string[][]};

const SEPARATOR = /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/;
const FENCE = /^\s*(```|~~~)/;

/**
 * Splits markdown into ordinary text and pipe tables, so a table can be drawn as one: react-markdown alone shows it as
 * a paragraph of `|`. A table is a row of cells, a `| --- |` line, then rows; one inside a code block stays code.
 */
export function splitMarkdownTables(markdown: string): MarkdownBlock[] {
  const lines = markdown.split('\n');
  const blocks: MarkdownBlock[] = [];
  let text: string[] = [];
  let isInFence = false;
  let index = 0;
  while (index < lines.length) {
    const line = lines[index] ?? '';
    if (FENCE.test(line)) {
      isInFence = !isInFence;
    }
    const next = lines[index + 1] ?? '';
    if (!isInFence && line.includes('|') && SEPARATOR.test(next)) {
      if (text.length > 0) {
        blocks.push({kind: 'markdown', text: text.join('\n')});
        text = [];
      }
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && isRow(lines[index] ?? '')) {
        rows.push(cellsOf(lines[index] ?? ''));
        index += 1;
      }
      blocks.push({kind: 'table', header: cellsOf(line), rows});
      continue;
    }
    text.push(line);
    index += 1;
  }
  if (text.length > 0) {
    blocks.push({kind: 'markdown', text: text.join('\n')});
  }
  return blocks;
}

/** A table goes on while lines are not empty and have a cell divider. */
function isRow(line: string): boolean {
  return line.trim() !== '' && /(?<!\\)\|/.test(line);
}

/** "| a | b \| c |" → ["a", "b | c"]: the outer pipes are optional, and `\|` is a pipe inside a cell. */
function cellsOf(line: string): string[] {
  const trimmed = line
    .trim()
    .replace(/^\|/, '')
    .replace(/(?<!\\)\|$/, '');
  return trimmed.split(/(?<!\\)\|/).map((cell) => cell.trim().replaceAll('\\|', '|'));
}
