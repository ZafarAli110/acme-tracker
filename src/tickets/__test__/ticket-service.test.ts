import {beforeEach, describe, expect, test} from 'bun:test';
import {openDatabase} from '../../database/open-database';
import {TicketRepository} from '../ticket-repository';
import {TicketService, TrackerError} from '../ticket-service';

const NOW = new Date('2026-11-03T09:00:00.000Z');

function newService(): TicketService {
  return new TicketService(new TicketRepository(openDatabase(':memory:')), () => NOW);
}

function expectTrackerError(work: () => unknown, status: number): void {
  try {
    work();
  } catch (error) {
    expect(error).toBeInstanceOf(TrackerError);
    expect((error as TrackerError).status).toBe(status);
    return;
  }
  throw new Error(`Expected a TrackerError with status ${status}`);
}

describe('TicketService', () => {
  let service: TicketService;

  beforeEach(() => {
    service = newService();
  });

  test('create gives the next key, puts the ticket last in the backlog, in To Do', () => {
    service.create({type: 'story', title: 'First', description: ''}, 'person');
    const second = service.create({type: 'bug', title: '  Second  ', description: 'Details'}, 'agent');

    expect(second.key).toBe('ACME-102');
    expect(second.title).toBe('Second');
    expect(second.status).toBe('to-do');
    expect(second.rank).toBe(2);
    expect(second.activity).toEqual([
      {
        id: 2,
        actor: 'agent',
        kind: 'created',
        fromStatus: null,
        toStatus: 'to-do',
        comment: null,
        at: NOW.toISOString(),
      },
    ]);
  });

  test('create rejects an empty title', () => {
    expectTrackerError(() => service.create({type: 'story', title: '  ', description: ''}, 'person'), 400);
  });

  test('changeStatus records who moved the ticket, from where to where', () => {
    service.create({type: 'story', title: 'Inventory screen', description: ''}, 'person');

    const ticket = service.changeStatus('acme-101', 'in-progress', 'agent');

    expect(ticket.status).toBe('in-progress');
    expect(ticket.lastActivity).toMatchObject({
      actor: 'agent',
      kind: 'status-changed',
      fromStatus: 'to-do',
      toStatus: 'in-progress',
    });
    expect(service.list()[0]?.lastActivity.kind).toBe('status-changed');
  });

  test('changeStatus to the current status records nothing', () => {
    service.create({type: 'story', title: 'Inventory screen', description: ''}, 'person');

    const ticket = service.changeStatus('ACME-101', 'to-do', 'agent');

    expect(ticket.activity).toHaveLength(1);
  });

  test('get and changeStatus report an unknown key as not found', () => {
    expectTrackerError(() => service.get('ACME-999'), 404);
    expectTrackerError(() => service.changeStatus('ACME-999', 'done', 'agent'), 404);
  });

  test('comment adds the trimmed text to the activity and rejects an empty one', () => {
    service.create({type: 'story', title: 'Inventory screen', description: ''}, 'person');

    const ticket = service.comment('ACME-101', '  Done, tests pass. ', 'agent');

    expect(ticket.lastActivity).toMatchObject({actor: 'agent', kind: 'commented', comment: 'Done, tests pass.'});
    expectTrackerError(() => service.comment('ACME-101', ' ', 'agent'), 400);
  });

  test('list filters by status, in backlog order', () => {
    service.create({type: 'story', title: 'A', description: ''}, 'person');
    service.create({type: 'story', title: 'B', description: ''}, 'person');
    service.create({type: 'story', title: 'C', description: ''}, 'person');
    service.changeStatus('ACME-103', 'done', 'agent');

    expect(service.list('to-do').map((ticket) => ticket.key)).toEqual(['ACME-101', 'ACME-102']);
    expect(service.list('done').map((ticket) => ticket.key)).toEqual(['ACME-103']);
  });

  test('reorder sets the backlog order', () => {
    service.create({type: 'story', title: 'A', description: ''}, 'person');
    service.create({type: 'story', title: 'B', description: ''}, 'person');
    service.create({type: 'story', title: 'C', description: ''}, 'person');

    const tickets = service.reorder(['ACME-103', 'acme-101', 'ACME-102']);

    expect(tickets.map((ticket) => [ticket.key, ticket.rank])).toEqual([
      ['ACME-103', 1],
      ['ACME-101', 2],
      ['ACME-102', 3],
    ]);
  });

  test('reorder rejects a list that misses or repeats a ticket', () => {
    service.create({type: 'story', title: 'A', description: ''}, 'person');
    service.create({type: 'story', title: 'B', description: ''}, 'person');

    expectTrackerError(() => service.reorder(['ACME-101']), 409);
    expectTrackerError(() => service.reorder(['ACME-101', 'ACME-101']), 409);
  });

  test('move saves the new status and the new order together, and records the move', () => {
    for (const title of ['A', 'B', 'C']) {
      service.create({type: 'story', title, description: ''}, 'person');
    }
    service.changeStatus('ACME-101', 'in-progress', 'person');

    const ticket = service.move('ACME-103', 'in-progress', 'ACME-101', 'person');

    expect(ticket.lastActivity).toMatchObject({kind: 'status-changed', fromStatus: 'to-do', toStatus: 'in-progress'});
    expect(service.list().map((item) => `${item.key}:${item.status}:${item.rank}`)).toEqual([
      'ACME-103:in-progress:1',
      'ACME-101:in-progress:2',
      'ACME-102:to-do:3',
    ]);
  });

  test('move within a column only reorders, and records nothing', () => {
    service.create({type: 'story', title: 'A', description: ''}, 'person');
    service.create({type: 'story', title: 'B', description: ''}, 'person');

    const ticket = service.move('ACME-102', 'to-do', 'ACME-101', 'person');

    expect(ticket.activity).toHaveLength(1);
    expect(service.list().map((item) => item.key)).toEqual(['ACME-102', 'ACME-101']);
  });

  test('move refuses a card to sit above a card in another column', () => {
    service.create({type: 'story', title: 'A', description: ''}, 'person');
    service.create({type: 'story', title: 'B', description: ''}, 'person');

    expectTrackerError(() => service.move('ACME-102', 'done', 'ACME-101', 'person'), 400);
    expect(service.get('ACME-102').status).toBe('to-do');
  });
});
