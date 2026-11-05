import {Box} from '@mui/material';
import {Children, type ReactNode} from 'react';
import ReactMarkdown from 'react-markdown';

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

/** Renders ticket markdown. Raw HTML in the markdown is shown as text, never run. */
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
      <ReactMarkdown components={{li: ListItem}}>{children}</ReactMarkdown>
    </Box>
  );
}
