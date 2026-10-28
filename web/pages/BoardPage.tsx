import {Alert, Box, Card, CardActionArea, CardContent, Skeleton, Stack, Typography} from '@mui/material';
import {useState, type DragEvent} from 'react';
import {useNavigate} from 'react-router';
import {STATUS_LABELS, TICKET_STATUSES, type TicketListItemDto, type TicketStatus} from '../../src/tickets/ticket-dto';
import {AgentMark} from '../tickets/AgentMark';
import {TypeChip} from '../tickets/TicketChips';
import {useMoveTicket, useTickets} from '../tickets/ticket-queries';

/** Where a dragged card would land: in `status`, above `beforeKey` (null: at the bottom of the column). */
interface DropTarget {
  status: TicketStatus;
  beforeKey: string | null;
}

/**
 * One column per status, each in backlog order. Drag a card to another column to change its status, or up and down a
 * column to change its priority; click it to open the ticket.
 */
export function BoardPage() {
  const tickets = useTickets();
  const moveTicket = useMoveTicket();
  const [dragged, setDragged] = useState<string | null>(null);
  const [target, setTarget] = useState<DropTarget | null>(null);

  if (tickets.isLoading) {
    return <Skeleton variant="rounded" height={400} />;
  }

  const all = tickets.data ?? [];

  // Over a card, the dragged card takes that card's place: it goes above it, or below it when it is dragged down its
  // own column (so a card can reach the bottom of its column).
  const targetOverCard = (card: TicketListItemDto, column: TicketListItemDto[]): DropTarget => {
    const from = column.findIndex((ticket) => ticket.key === dragged);
    const to = column.indexOf(card);
    const below = from !== -1 && from < to;
    return {status: card.status, beforeKey: below ? (column[to + 1]?.key ?? null) : card.key};
  };

  const drop = (event: DragEvent, dropTarget: DropTarget) => {
    event.preventDefault();
    event.stopPropagation();
    const key = event.dataTransfer.getData('text/plain');
    setDragged(null);
    setTarget(null);
    if (key && key !== dropTarget.beforeKey) {
      moveTicket.mutate({key, ...dropTarget});
    }
  };

  return (
    <Stack sx={{gap: 2}}>
      {(tickets.error ?? moveTicket.error) && (
        <Alert severity="error">{(tickets.error ?? moveTicket.error)?.message}</Alert>
      )}
      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(4, minmax(0, 1fr))'}, gap: 2}}>
        {TICKET_STATUSES.map((status) => {
          const column = all.filter((ticket) => ticket.status === status);
          const atBottom = target?.status === status && target.beforeKey === null;
          return (
            <Box
              key={status}
              onDragOver={(event) => {
                event.preventDefault();
                if (!atBottom) {
                  setTarget({status, beforeKey: null});
                }
              }}
              onDrop={(event) => drop(event, {status, beforeKey: null})}
              sx={{
                bgcolor: 'action.hover',
                borderRadius: 2,
                p: 1.5,
                minHeight: 420,
                outline: target?.status === status ? 2 : 0,
                outlineColor: 'primary.main',
              }}
              data-testid={`column-${status}`}
            >
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{display: 'block', mb: 1, fontWeight: 600, lineHeight: 2}}
              >
                {STATUS_LABELS[status]} · {column.length}
              </Typography>
              <Stack sx={{gap: 1}}>
                {column.map((ticket) => {
                  const cardTarget = targetOverCard(ticket, column);
                  return (
                    <BoardCard
                      key={ticket.key}
                      ticket={ticket}
                      dragging={dragged === ticket.key}
                      dropAbove={target?.status === status && target.beforeKey === ticket.key}
                      onDragStart={() => setDragged(ticket.key)}
                      onDragEnd={() => {
                        setDragged(null);
                        setTarget(null);
                      }}
                      onDragOver={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (target?.status !== cardTarget.status || target.beforeKey !== cardTarget.beforeKey) {
                          setTarget(cardTarget);
                        }
                      }}
                      onDrop={(event) => drop(event, cardTarget)}
                    />
                  );
                })}
                {atBottom && column.length > 0 && <DropLine />}
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
}

interface BoardCardProps {
  ticket: TicketListItemDto;
  dragging: boolean;
  dropAbove: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent) => void;
  onDrop: (event: DragEvent) => void;
}

function BoardCard({ticket, dragging, dropAbove, onDragStart, onDragEnd, onDragOver, onDrop}: BoardCardProps) {
  const navigate = useNavigate();
  return (
    <Box onDragOver={onDragOver} onDrop={onDrop}>
      {dropAbove && <DropLine />}
      <Card
        draggable
        onDragStart={(event) => {
          event.dataTransfer.setData('text/plain', ticket.key);
          event.dataTransfer.effectAllowed = 'move';
          onDragStart();
        }}
        onDragEnd={onDragEnd}
        sx={{cursor: 'grab', opacity: dragging ? 0.4 : 1}}
        data-testid={`card-${ticket.key}`}
      >
        <CardActionArea onClick={() => navigate(`/tickets/${ticket.key}`)}>
          <CardContent sx={{p: 1.5, '&:last-child': {pb: 1.5}}}>
            <Stack direction="row" sx={{alignItems: 'center', gap: 1, mb: 0.5}}>
              <Typography variant="caption" color="primary" sx={{fontWeight: 700}}>
                {ticket.key}
              </Typography>
              <TypeChip type={ticket.type} />
            </Stack>
            <Typography variant="body2">{ticket.title}</Typography>
            <AgentMark activity={ticket.lastActivity} />
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  );
}

/** Shows where the dragged card will land. */
function DropLine() {
  return <Box sx={{height: 3, borderRadius: 2, bgcolor: 'primary.main', mb: 1}} data-testid="drop-line" />;
}
