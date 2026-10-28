import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {Alert, Paper, Skeleton, Table, TableBody, TableCell, TableRow, Typography} from '@mui/material';
import {useState} from 'react';
import {useNavigate} from 'react-router';
import type {TicketListItemDto} from '../../src/tickets/ticket-dto';
import {AgentMark} from '../tickets/AgentMark';
import {StatusChip, TypeChip} from '../tickets/TicketChips';
import {useReorder, useTickets} from '../tickets/ticket-queries';

/** Every ticket in priority order. Drag a row to reorder; click it to open the ticket. */
export function BacklogPage() {
  const tickets = useTickets();
  const reorder = useReorder();
  const navigate = useNavigate();
  const [dragged, setDragged] = useState<string | null>(null);

  if (tickets.isLoading) {
    return <Skeleton variant="rounded" height={300} />;
  }

  // Dropping on a row takes that row's place: a ticket dragged up goes above it, one dragged down goes below it.
  const move = (movingKey: string, targetKey: string) => {
    const list = tickets.data ?? [];
    const from = list.findIndex((ticket) => ticket.key === movingKey);
    const to = list.findIndex((ticket) => ticket.key === targetKey);
    const moving = list[from];
    if (moving === undefined || to === -1 || from === to) {
      return;
    }
    const reordered: TicketListItemDto[] = list.filter((ticket) => ticket.key !== movingKey);
    reordered.splice(to, 0, moving);
    reorder.mutate(reordered.map((ticket, position) => ({...ticket, rank: position + 1})));
  };

  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
        Top of the list is worked on first. Drag a row to change the order.
      </Typography>
      {(tickets.error ?? reorder.error) && (
        <Alert severity="error" sx={{mb: 2}}>
          {(tickets.error ?? reorder.error)?.message}
        </Alert>
      )}
      <Paper>
        <Table>
          <TableBody>
            {tickets.data?.map((ticket) => (
              <TableRow
                key={ticket.key}
                hover
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData('text/plain', ticket.key);
                  setDragged(ticket.key);
                }}
                onDragEnd={() => setDragged(null)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  move(event.dataTransfer.getData('text/plain'), ticket.key);
                  setDragged(null);
                }}
                onClick={() => navigate(`/tickets/${ticket.key}`)}
                sx={{cursor: 'pointer', opacity: dragged === ticket.key ? 0.4 : 1}}
                data-testid={`row-${ticket.key}`}
              >
                <TableCell sx={{width: 32, pr: 0, color: 'text.disabled', cursor: 'grab'}}>
                  <DragIndicatorIcon fontSize="small" />
                </TableCell>
                <TableCell sx={{width: 100}}>
                  <Typography variant="body2" color="primary" sx={{fontWeight: 700}}>
                    {ticket.key}
                  </Typography>
                </TableCell>
                <TableCell>
                  {ticket.title}
                  <AgentMark activity={ticket.lastActivity} />
                </TableCell>
                <TableCell sx={{width: 80}}>
                  <TypeChip type={ticket.type} />
                </TableCell>
                <TableCell sx={{width: 130}}>
                  <StatusChip status={ticket.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
