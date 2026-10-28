import type {TicketStatus} from './ticket-dto';

interface Movable {
  key: string;
  status: TicketStatus;
}

/**
 * Where a ticket lands when it is dropped on the board: in `status`, just before `beforeKey`, or at the end of that
 * status's tickets when `beforeKey` is null. Returns every ticket in the new backlog order. The board shows each column
 * in backlog order, so moving a card on the board moves it in the backlog too. Used by the server and, for the
 * optimistic update, by the web page, so both always agree.
 */
export function moveTicket<T extends Movable>(
  tickets: T[],
  key: string,
  status: TicketStatus,
  beforeKey: string | null,
): T[] {
  const moving = tickets.find((ticket) => ticket.key === key);
  if (moving === undefined || moving.key === beforeKey) {
    return tickets;
  }
  const others = tickets.filter((ticket) => ticket.key !== key);
  const moved = {...moving, status};

  let index: number;
  if (beforeKey !== null) {
    index = others.findIndex((ticket) => ticket.key === beforeKey);
  } else {
    // After the last ticket of the column; into an empty column, the ticket keeps its place in the backlog.
    const lastInColumn = others.findLastIndex((ticket) => ticket.status === status);
    index = lastInColumn === -1 ? tickets.indexOf(moving) : lastInColumn + 1;
  }
  return [...others.slice(0, index), moved, ...others.slice(index)];
}
