import {existsSync, rmSync} from 'node:fs';
import {join} from 'node:path';
import {openDatabase} from './database/open-database';
import {seedTickets} from './tickets/seed-tickets';
import {TicketRepository} from './tickets/ticket-repository';
import {TicketService} from './tickets/ticket-service';

const ROOT = join(import.meta.dir, '..');
export const DATABASE_PATH = join(ROOT, 'data', 'tracker.db');
export const SEED_DIRECTORY = join(ROOT, 'seed', 'tickets');

/** Opens the tracker's database, seeding it from seed/tickets the first time. */
export function openTracker(): TicketService {
  const ticketService = new TicketService(new TicketRepository(openDatabase(DATABASE_PATH)));
  if (ticketService.list().length === 0) {
    const count = seedTickets(ticketService, SEED_DIRECTORY);
    console.log(`Seeded ${count} tickets from seed/tickets`);
  }
  return ticketService;
}

/** Deletes the database; the next start seeds it again. */
export function deleteTrackerData(): boolean {
  const existed = existsSync(DATABASE_PATH);
  for (const suffix of ['', '-wal', '-shm']) {
    rmSync(`${DATABASE_PATH}${suffix}`, {force: true});
  }
  return existed;
}
