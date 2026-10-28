import {Chip, type ChipProps} from '@mui/material';
import {STATUS_LABELS, type TicketStatus, type TicketType} from '../../src/tickets/ticket-dto';

const STATUS_COLOURS: Record<TicketStatus, ChipProps['color']> = {
  'to-do': 'default',
  'in-progress': 'info',
  'in-review': 'warning',
  done: 'success',
};

export function StatusChip({status}: {status: TicketStatus}) {
  return <Chip size="small" label={STATUS_LABELS[status]} color={STATUS_COLOURS[status]} variant="outlined" />;
}

export function TypeChip({type}: {type: TicketType}) {
  return (
    <Chip
      size="small"
      label={type === 'bug' ? 'Bug' : 'Story'}
      color={type === 'bug' ? 'error' : 'success'}
      sx={{height: 20, fontSize: 11}}
    />
  );
}
