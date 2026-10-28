import {Box} from '@mui/material';
import ReactMarkdown from 'react-markdown';

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
      <ReactMarkdown>{children}</ReactMarkdown>
    </Box>
  );
}
