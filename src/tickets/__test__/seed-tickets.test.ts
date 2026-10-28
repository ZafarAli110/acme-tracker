import {describe, expect, test} from 'bun:test';
import {join} from 'node:path';
import {openDatabase} from '../../database/open-database';
import {parseSeedTicket, seedTickets} from '../seed-tickets';
import {TicketRepository} from '../ticket-repository';
import {TicketService} from '../ticket-service';

describe('parseSeedTicket', () => {
  test('reads the type, key, title and description', () => {
    const ticket = parseSeedTicket(
      '---\r\ntype: bug\r\n---\r\n\r\n# ACME-106 "Recently contacted" shows other customers\r\n\r\nReported by Maria.\r\n',
      'ACME-106.md',
    );

    expect(ticket).toEqual({
      key: 'ACME-106',
      type: 'bug',
      title: '"Recently contacted" shows other customers',
      description: 'Reported by Maria.',
    });
  });

  test('rejects a file without front matter or with an unknown type', () => {
    expect(() => parseSeedTicket('# ACME-101 Title\n', 'a.md')).toThrow('a.md');
    expect(() => parseSeedTicket('---\ntype: epic\n---\n# ACME-101 Title\n', 'b.md')).toThrow('type must be');
  });
});

describe('seedTickets', () => {
  test('creates the seed tickets with the keys their files name', () => {
    const service = new TicketService(new TicketRepository(openDatabase(':memory:')));

    const count = seedTickets(service, join(import.meta.dir, '..', '..', '..', 'seed', 'tickets'));

    const tickets = service.list();
    expect(count).toBe(7);
    expect(tickets.map((ticket) => ticket.key)).toEqual([
      'ACME-101',
      'ACME-102',
      'ACME-103',
      'ACME-104',
      'ACME-105',
      'ACME-106',
      'ACME-107',
    ]);
    expect(tickets.every((ticket) => ticket.status === 'to-do')).toBe(true);
    expect(tickets.find((ticket) => ticket.key === 'ACME-106')?.type).toBe('bug');
  });
});
