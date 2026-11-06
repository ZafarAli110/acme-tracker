import {describe, expect, it} from 'bun:test';
import {splitMarkdownTables} from '../markdown-tables';

describe('splitMarkdownTables', () => {
  it('finds a pipe table between paragraphs, with its header and rows', () => {
    const blocks = splitMarkdownTables(
      [
        '**Verified.**',
        '',
        '| Check | Result |',
        '| --- | --- |',
        '| maria | 5 customers |',
        '| sam | 0 missing |',
        '',
        'Evidence: x',
      ].join('\n'),
    );

    expect(blocks).toEqual([
      {kind: 'markdown', text: '**Verified.**\n'},
      {
        kind: 'table',
        header: ['Check', 'Result'],
        rows: [
          ['maria', '5 customers'],
          ['sam', '0 missing'],
        ],
      },
      {kind: 'markdown', text: '\nEvidence: x'},
    ]);
  });

  it('reads cells without outer pipes, with alignment colons, and with an escaped pipe inside a cell', () => {
    const [table] = splitMarkdownTables(['a | b', ':--- | ---:', '`x \\| y` | 2'].join('\n'));

    expect(table).toEqual({kind: 'table', header: ['a', 'b'], rows: [['`x | y`', '2']]});
  });

  it('leaves a table inside a code block as code, and text with a pipe but no separator as text', () => {
    const markdown = ['```', '| a | b |', '| --- | --- |', '```', 'one | two'].join('\n');

    expect(splitMarkdownTables(markdown)).toEqual([{kind: 'markdown', text: markdown}]);
  });
});
