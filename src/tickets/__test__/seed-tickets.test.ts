import {describe, expect, test} from 'bun:test';
import {copyFileSync, mkdtempSync, readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
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

const SEED_DIRECTORY = join(import.meta.dir, '..', '..', '..', 'seed', 'tickets');

/** A seed directory holding only the first `count` seed tickets: a tracker started before the later ones were written. */
function olderSeedDirectory(count: number): string {
  const directory = mkdtempSync(join(tmpdir(), 'acme-seed-'));
  for (const name of readdirSync(SEED_DIRECTORY).toSorted().slice(0, count)) {
    copyFileSync(join(SEED_DIRECTORY, name), join(directory, name));
  }
  return directory;
}

describe('seedTickets', () => {
  test('creates the seed tickets with the keys their files name', () => {
    const service = new TicketService(new TicketRepository(openDatabase(':memory:')));

    const added = seedTickets(service, SEED_DIRECTORY);

    const tickets = service.list();
    expect(added).toHaveLength(25);
    expect(tickets.map((ticket) => ticket.key)).toEqual([
      'ACME-101',
      'ACME-102',
      'ACME-103',
      'ACME-104',
      'ACME-105',
      'ACME-106',
      'ACME-107',
      'ACME-108',
      'ACME-109',
      'ACME-110',
      'ACME-111',
      'ACME-112',
      'ACME-113',
      'ACME-114',
      'ACME-115',
      'ACME-116',
      'ACME-117',
      'ACME-118',
      'ACME-119',
      'ACME-120',
      'ACME-121',
      'ACME-122',
      'ACME-123',
      'ACME-124',
      'ACME-125',
    ]);
    expect(tickets.every((ticket) => ticket.status === 'to-do')).toBe(true);
    expect(tickets.find((ticket) => ticket.key === 'ACME-106')?.type).toBe('bug');
  });

  test('adds only the tickets a tracker started earlier does not have, and leaves the others as they are', () => {
    const service = new TicketService(new TicketRepository(openDatabase(':memory:')));
    seedTickets(service, olderSeedDirectory(7));
    service.changeStatus('ACME-101', 'in-progress', 'person');

    const added = seedTickets(service, SEED_DIRECTORY);

    expect(added).toEqual([
      'ACME-108',
      'ACME-109',
      'ACME-110',
      'ACME-111',
      'ACME-112',
      'ACME-113',
      'ACME-114',
      'ACME-115',
      'ACME-116',
      'ACME-117',
      'ACME-118',
      'ACME-119',
      'ACME-120',
      'ACME-121',
      'ACME-122',
      'ACME-123',
      'ACME-124',
      'ACME-125',
    ]);
    expect(service.list()).toHaveLength(25);
    expect(service.get('ACME-101').status).toBe('in-progress');
  });

  test('skips a seed ticket whose key a ticket made in the tracker already has, and keeps that ticket', () => {
    const service = new TicketService(new TicketRepository(openDatabase(':memory:')));
    seedTickets(service, olderSeedDirectory(7));
    service.create({type: 'bug', title: 'Found while checking ACME-107', description: 'Steps'}, 'agent');

    const added = seedTickets(service, SEED_DIRECTORY);

    expect(added).toEqual([
      'ACME-109',
      'ACME-110',
      'ACME-111',
      'ACME-112',
      'ACME-113',
      'ACME-114',
      'ACME-115',
      'ACME-116',
      'ACME-117',
      'ACME-118',
      'ACME-119',
      'ACME-120',
      'ACME-121',
      'ACME-122',
      'ACME-123',
      'ACME-124',
      'ACME-125',
    ]);
    expect(service.get('ACME-108').title).toBe('Found while checking ACME-107');
  });
});
