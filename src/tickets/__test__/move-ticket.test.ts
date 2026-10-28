import {describe, expect, test} from 'bun:test';
import {moveTicket} from '../move-ticket';
import type {TicketStatus} from '../ticket-dto';

// Backlog order: A, B, C (To Do), D (In Progress), E (To Do).
const BACKLOG: {key: string; status: TicketStatus}[] = [
  {key: 'A', status: 'to-do'},
  {key: 'B', status: 'to-do'},
  {key: 'C', status: 'to-do'},
  {key: 'D', status: 'in-progress'},
  {key: 'E', status: 'to-do'},
];

const order = (tickets: {key: string; status: TicketStatus}[]) =>
  tickets.map((ticket) => `${ticket.key}:${ticket.status}`).join(' ');

describe('moveTicket', () => {
  test('moves a card up its column, before another card', () => {
    expect(order(moveTicket(BACKLOG, 'C', 'to-do', 'A'))).toBe('C:to-do A:to-do B:to-do D:in-progress E:to-do');
  });

  test('moves a card down its column, before another card', () => {
    expect(order(moveTicket(BACKLOG, 'A', 'to-do', 'E'))).toBe('B:to-do C:to-do D:in-progress A:to-do E:to-do');
  });

  test('moves a card to another column, before a card there', () => {
    expect(order(moveTicket(BACKLOG, 'E', 'in-progress', 'D'))).toBe(
      'A:to-do B:to-do C:to-do E:in-progress D:in-progress',
    );
  });

  test('drops a card at the bottom of another column', () => {
    expect(order(moveTicket(BACKLOG, 'A', 'in-progress', null))).toBe(
      'B:to-do C:to-do D:in-progress A:in-progress E:to-do',
    );
  });

  test('drops a card into an empty column without moving it in the backlog', () => {
    expect(order(moveTicket(BACKLOG, 'B', 'done', null))).toBe('A:to-do B:done C:to-do D:in-progress E:to-do');
  });

  test('dropping a card on itself changes nothing', () => {
    expect(moveTicket(BACKLOG, 'B', 'to-do', 'B')).toBe(BACKLOG);
  });
});
