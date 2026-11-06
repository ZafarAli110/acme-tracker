import {Box, Table, TableBody, TableCell, TableHead, TableRow} from '@mui/material';
import {Children, Fragment, type ReactNode} from 'react';
import ReactMarkdown from 'react-markdown';
import {splitMarkdownTables} from './markdown-tables';

const TASK = /^\[( |x|X)\]\s+/;

/**
 * A list item that starts `[ ]` or `[x]` is a task, as agents write their checklists ("- [x] **T1** PASS: …"): it is
 * drawn with a box, ticked or not, instead of the brackets.
 */
function ListItem({children}: {children?: ReactNode}) {
  const parts = Children.toArray(children);
  const first = parts[0];
  const match = typeof first === 'string' ? TASK.exec(first) : null;
  if (!match || typeof first !== 'string') {
    return <li>{children}</li>;
  }
  const isDone = match[1] !== ' ';
  return (
    <Box component="li" sx={{listStyle: 'none', ml: -2.5}} data-testid={isDone ? 'task-done' : 'task-open'}>
      <Box
        component="span"
        aria-label={isDone ? 'done' : 'not done'}
        sx={{mr: 0.75, color: isDone ? 'success.main' : 'text.secondary'}}
      >
        {isDone ? '☑' : '☐'}
      </Box>
      {first.slice(match[0].length)}
      {parts.slice(1)}
    </Box>
  );
}

/** A paragraph's content without the paragraph: a cell holds one line. */
function Unwrapped({children}: {children?: ReactNode}) {
  return <Fragment>{children}</Fragment>;
}

/** A table cell's markdown (code, bold, a link) on one line: without the paragraph react-markdown wraps it in. */
function InlineMarkdown({children}: {children: string}) {
  return <ReactMarkdown components={{li: ListItem, p: Unwrapped}}>{children}</ReactMarkdown>;
}

function MarkdownTable({header, rows}: {header: string[]; rows: string[][]}) {
  return (
    <Box sx={{overflowX: 'auto', my: 1.5}}>
      <Table size="small" data-testid="markdown-table">
        <TableHead>
          <TableRow>
            {header.map((cell, column) => (
              <TableCell key={column} sx={{fontWeight: 600}}>
                <InlineMarkdown>{cell}</InlineMarkdown>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, line) => (
            <TableRow key={line}>
              {header.map((_, column) => (
                <TableCell key={column}>
                  <InlineMarkdown>{row[column] ?? ''}</InlineMarkdown>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

/** Renders ticket markdown, pipe tables included. Raw HTML in the markdown is shown as text, never run. */
export function Markdown({children}: {children: string}) {
  return (
    <Box
      sx={{
        typography: 'body2',
        '& h1, & h2, & h3': {typography: 'subtitle1', fontWeight: 600, mt: 2.5, mb: 1},
        '& p': {my: 1},
        '& ul, & ol': {pl: 3, my: 1},
        '& li': {my: 0.5},
        '& code': {
          fontFamily: 'ui-monospace, monospace',
          fontSize: '0.85em',
          bgcolor: 'action.hover',
          px: 0.5,
          borderRadius: 0.5,
        },
        '& blockquote': {borderLeft: 3, borderColor: 'divider', pl: 2, ml: 0, color: 'text.secondary'},
      }}
    >
      {splitMarkdownTables(children).map((block, index) =>
        block.kind === 'table' ? (
          <MarkdownTable key={index} header={block.header} rows={block.rows} />
        ) : (
          <ReactMarkdown key={index} components={{li: ListItem}}>
            {block.text}
          </ReactMarkdown>
        ),
      )}
    </Box>
  );
}
